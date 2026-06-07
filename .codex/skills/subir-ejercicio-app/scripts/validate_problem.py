#!/usr/bin/env python3
"""Valida problemas JSON de la aplicación de ejercicios."""

import argparse
import json
import re
from pathlib import Path

REQUIRED_ROOT = {
    "id",
    "asignatura",
    "categoria",
    "tema",
    "subtema",
    "nivel",
    "titulo",
    "enunciado",
    "steps",
}
REQUIRED_STEP = {"tipo", "titulo", "formula", "textoPizarra", "voz"}
LEVELS = {"basico", "medio", "examen", "avanzado"}
RAW_MATH = re.compile(
    r"sqrt\s*\(|\b[A-Za-z]+_(?:prime|second|dot|ddot)\b|\bsum_[A-Za-z0-9]+\b"
)
CORRUPTED_WORD = re.compile(r"[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]μ|μ[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]")


def iter_strings(value, location="root"):
    if isinstance(value, dict):
        for key, item in value.items():
            yield from iter_strings(item, f"{location}.{key}")
    elif isinstance(value, list):
        for index, item in enumerate(value):
            yield from iter_strings(item, f"{location}[{index}]")
    elif isinstance(value, str):
        yield location, value


def validate(path):
    errors = []
    try:
        problem = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        return [f"JSON no válido o ilegible: {exc}"]

    if not isinstance(problem, dict):
        return ["La raíz debe ser un objeto JSON."]

    missing = sorted(REQUIRED_ROOT - problem.keys())
    if missing:
        errors.append(f"Faltan campos raíz: {', '.join(missing)}")

    expected_id = path.stem
    if problem.get("id") != expected_id:
        errors.append(f"id debe ser '{expected_id}'.")
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*-t\d+_[a-z0-9-]+_[a-z0-9-]+", expected_id):
        errors.append("El nombre no sigue asignatura-tN_subtema_nombre-del-ejercicio.json.")
    if not re.fullmatch(r"T\d+", str(problem.get("tema", ""))):
        errors.append("tema debe tener formato T0, T1, T2...")
    if problem.get("nivel") not in LEVELS:
        errors.append(f"nivel debe ser uno de: {', '.join(sorted(LEVELS))}.")

    steps = problem.get("steps")
    if not isinstance(steps, list) or not steps:
        errors.append("steps debe ser una lista no vacía.")
    else:
        first = steps[0]
        if not isinstance(first, dict):
            errors.append("steps[0] debe ser un objeto.")
        else:
            if first.get("tipo") != "enunciado":
                errors.append("steps[0].tipo debe ser 'enunciado'.")
            if first.get("titulo") != "Problema":
                errors.append("steps[0].titulo debe ser 'Problema'.")
            if first.get("formula") != "":
                errors.append("steps[0].formula debe estar vacío.")
            if first.get("textoPizarra") != "":
                errors.append("steps[0].textoPizarra debe estar vacío.")
            if not str(first.get("voz", "")).strip():
                errors.append("steps[0].voz debe leer el enunciado.")

        for index, step in enumerate(steps):
            if not isinstance(step, dict):
                errors.append(f"steps[{index}] debe ser un objeto.")
                continue
            missing_step = sorted(REQUIRED_STEP - step.keys())
            if missing_step:
                errors.append(f"steps[{index}] carece de: {', '.join(missing_step)}")
            formula = step.get("formula", "")
            if not isinstance(formula, (str, list)):
                errors.append(f"steps[{index}].formula debe ser string o lista.")
            if isinstance(formula, list) and not all(isinstance(line, str) for line in formula):
                errors.append(f"steps[{index}].formula solo puede contener strings.")
            formula_text = "\n".join(formula) if isinstance(formula, list) else str(formula)
            if RAW_MATH.search(formula_text):
                errors.append(f"steps[{index}].formula contiene notación cruda.")
            if RAW_MATH.search(str(step.get("voz", ""))):
                errors.append(f"steps[{index}].voz contiene notación cruda para TTS.")

    enunciado = str(problem.get("enunciado", ""))
    if RAW_MATH.search(enunciado):
        errors.append("enunciado contiene notación matemática cruda.")

    for location, text in iter_strings(problem):
        if CORRUPTED_WORD.search(text):
            errors.append(f"{location} contiene μ incrustada en una palabra.")

    return errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("paths", nargs="+", type=Path, help="JSON que se deben validar")
    args = parser.parse_args()

    failed = False
    for path in args.paths:
        errors = validate(path)
        if errors:
            failed = True
            print(f"FAIL {path}")
            for error in errors:
                print(f"  - {error}")
        else:
            print(f"OK   {path}")
    raise SystemExit(1 if failed else 0)


if __name__ == "__main__":
    main()
