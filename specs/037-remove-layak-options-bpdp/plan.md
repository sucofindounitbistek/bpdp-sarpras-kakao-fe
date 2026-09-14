# Implementation Plan: Remove "Layak / Tidak Layak" Radio Options in BPDP Verifikator View (037-remove-layak-options-bpdp)

**Branch**: `037-remove-layak-options-bpdp` | **Date**: 2026-08-14 | **Spec**: [`spec.md`](./spec.md)

**Input**: Feature specification from `/specs/037-remove-layak-options-bpdp/spec.md`

## Summary

This feature removes the redundant "1. Status Penilaian Kelayakan" radio choices (`Layak` / `Tidak Layak`) from `src/views/bpdp/CekiBpdpView.vue`, streamlining the BPDP Verifikator workflow.

## Technical Context

**Language/Version**: Vue 3 (Composition API `<script setup>`), TypeScript (Strict Mode)  
**Primary Dependencies**: Vue Router, Pinia  
**Testing**: Manual runtime verification & strict type-checking (`vue-tsc -b`)  
**Target Platform**: Responsive Web (Mobile to Desktop)  
**Project Type**: Vue 3 Frontend Single-Page Application  
**Scale/Scope**: 1 file modified (`CekiBpdpView.vue`)  

## Constitution Check

- [x] **Principle I (Vue 3 SFC & Component Architecture)**: View component uses `<script setup>`.
- [x] **Principle IV (UI/UX Pro Max Standards)**: Clean, un-cluttered card interface.

## Proposed Changes

### UI Component Layer
#### [MODIFY] [`CekiBpdpView.vue`](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/views/bpdp/CekiBpdpView.vue)
Remove lines 537-564 rendering the "1. Status Penilaian Kelayakan" radio choices.

## Verification Plan

### Automated Tests
- Type checking: `npx vue-tsc -b`

### Manual Verification
1. Open `/bpdp/ceki/1` as `BPDP_VERIFIKATOR`.
2. Check all items and verify "Layak / Tidak Layak" radio choices are no longer present.
