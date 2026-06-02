import numpy as np
import librosa
import soundfile as sf
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class AnalysisResult:
    pitch_score: float
    tempo_score: float
    consistency_score: float
    overall_score: float
    strengths: list[str]
    weaknesses: list[str]
    feedback: str
    duration: float
    tempo_bpm: float


def _clamp(value: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return max(lo, min(hi, value))


def _analyze_pitch(y: np.ndarray, sr: int) -> tuple[float, float]:
    """Return (pitch_score, mean_f0_hz)."""
    hop_length = 512
    fmin = librosa.note_to_hz("C2")
    fmax = librosa.note_to_hz("C7")

    f0, voiced_flag, voiced_probs = librosa.pyin(
        y, fmin=fmin, fmax=fmax, sr=sr, hop_length=hop_length
    )

    voiced_f0 = f0[voiced_flag & ~np.isnan(f0)]

    if len(voiced_f0) < 10:
        return 30.0, 0.0

    voiced_ratio = len(voiced_f0) / max(len(f0), 1)

    log_f0 = np.log2(voiced_f0 + 1e-9)
    pitch_std = np.std(log_f0)

    stability_score = _clamp(100.0 - (pitch_std * 150.0))
    voiced_score = _clamp(voiced_ratio * 120.0)

    score = _clamp(0.5 * stability_score + 0.5 * voiced_score)
    return score, float(np.mean(voiced_f0))


def _analyze_tempo(y: np.ndarray, sr: int) -> tuple[float, float]:
    """Return (tempo_score, bpm)."""
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    tempo, beats = librosa.beat.beat_track(onset_envelope=onset_env, sr=sr)

    if isinstance(tempo, np.ndarray):
        tempo = float(tempo[0]) if len(tempo) > 0 else 0.0
    else:
        tempo = float(tempo)

    if len(beats) < 4:
        return 40.0, tempo

    beat_times = librosa.frames_to_time(beats, sr=sr)
    intervals = np.diff(beat_times)

    if len(intervals) < 3:
        return 50.0, tempo

    interval_std = np.std(intervals)
    interval_mean = np.mean(intervals)
    cv = interval_std / (interval_mean + 1e-9)

    tempo_consistency = _clamp(100.0 - (cv * 200.0))

    reasonable_tempo = 1.0 if 60 <= tempo <= 200 else 0.7
    score = _clamp(tempo_consistency * reasonable_tempo)
    return score, tempo


def _analyze_consistency(y: np.ndarray, sr: int) -> float:
    """Amplitude + rhythm stability -> consistency score."""
    frame_length = 2048
    hop_length = 512

    rms = librosa.feature.rms(y=y, frame_length=frame_length, hop_length=hop_length)[0]
    rms_nonzero = rms[rms > 1e-6]

    if len(rms_nonzero) < 5:
        return 30.0

    rms_cv = np.std(rms_nonzero) / (np.mean(rms_nonzero) + 1e-9)
    amplitude_score = _clamp(100.0 - (rms_cv * 80.0))

    onset_env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop_length)
    onset_frames = librosa.onset.onset_detect(onset_envelope=onset_env, sr=sr, hop_length=hop_length)

    if len(onset_frames) > 4:
        onset_times = librosa.frames_to_time(onset_frames, sr=sr, hop_length=hop_length)
        onset_intervals = np.diff(onset_times)
        rhythm_cv = np.std(onset_intervals) / (np.mean(onset_intervals) + 1e-9)
        rhythm_score = _clamp(100.0 - (rhythm_cv * 60.0))
    else:
        rhythm_score = 50.0

    return _clamp(0.5 * amplitude_score + 0.5 * rhythm_score)


def _generate_feedback(
    pitch_score: float,
    tempo_score: float,
    consistency_score: float,
    overall_score: float,
    tempo_bpm: float,
) -> tuple[list[str], list[str], str]:
    strengths: list[str] = []
    weaknesses: list[str] = []

    # Pitch feedback
    if pitch_score >= 85:
        strengths.append("Excellent pitch accuracy and control")
    elif pitch_score >= 70:
        strengths.append("Good pitch control with minor deviations")
    elif pitch_score >= 55:
        weaknesses.append("Pitch accuracy needs some work — focus on hitting target notes cleanly")
    else:
        weaknesses.append("Significant pitch inaccuracies detected — consider ear training exercises")

    # Tempo feedback
    if tempo_score >= 85:
        strengths.append("Strong and consistent tempo throughout the performance")
    elif tempo_score >= 70:
        strengths.append("Generally good tempo with occasional fluctuations")
    elif tempo_score >= 55:
        weaknesses.append("Tempo inconsistencies detected — try practicing with a metronome")
    else:
        weaknesses.append("Tempo is unstable — dedicated rhythm training is recommended")

    # Consistency feedback
    if consistency_score >= 85:
        strengths.append("Very stable and consistent vocal delivery")
    elif consistency_score >= 70:
        strengths.append("Reasonably consistent amplitude and rhythm")
    elif consistency_score >= 55:
        weaknesses.append("Some inconsistency in vocal volume — work on breath support")
    else:
        weaknesses.append("Inconsistent delivery — focus on breath control and steady phrasing")

    # Overall
    if overall_score >= 85:
        level = "outstanding"
    elif overall_score >= 70:
        level = "good"
    elif overall_score >= 55:
        level = "fair"
    else:
        level = "developing"

    bpm_note = f" at approximately {tempo_bpm:.0f} BPM" if tempo_bpm > 0 else ""
    summary = (
        f"Overall this is a {level} vocal performance{bpm_note}. "
        f"Pitch score: {pitch_score:.0f}/100, "
        f"Tempo score: {tempo_score:.0f}/100, "
        f"Consistency score: {consistency_score:.0f}/100. "
    )

    if strengths:
        summary += "Key strengths: " + "; ".join(strengths) + ". "
    if weaknesses:
        summary += "Areas to improve: " + "; ".join(weaknesses) + "."
    else:
        summary += "Keep up the great work!"

    return strengths, weaknesses, summary


def analyze_audio(file_path: str) -> AnalysisResult:
    y, sr = librosa.load(file_path, sr=None, mono=True)

    if len(y) == 0:
        raise ValueError("Audio file is empty or unreadable")

    duration = librosa.get_duration(y=y, sr=sr)

    if sr > 22050:
        y = librosa.resample(y, orig_sr=sr, target_sr=22050)
        sr = 22050

    y, _ = librosa.effects.trim(y, top_db=20)

    pitch_score, mean_f0 = _analyze_pitch(y, sr)
    tempo_score, tempo_bpm = _analyze_tempo(y, sr)
    consistency_score = _analyze_consistency(y, sr)

    overall_score = _clamp(
        pitch_score * 0.4 + tempo_score * 0.3 + consistency_score * 0.3
    )

    strengths, weaknesses, feedback = _generate_feedback(
        pitch_score, tempo_score, consistency_score, overall_score, tempo_bpm
    )

    return AnalysisResult(
        pitch_score=round(pitch_score, 1),
        tempo_score=round(tempo_score, 1),
        consistency_score=round(consistency_score, 1),
        overall_score=round(overall_score, 1),
        strengths=strengths,
        weaknesses=weaknesses,
        feedback=feedback,
        duration=round(duration, 2),
        tempo_bpm=round(tempo_bpm, 1),
    )
