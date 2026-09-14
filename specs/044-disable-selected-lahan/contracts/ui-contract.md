# UI & Interaction Contract: Disable Selected Lahan

## Component Interaction Controls in `StepPilihPekebunLahan.vue`

### 1. Land Checkbox & Row Item
- **Condition**: If `getLahanActiveProposal(lahan)` returns a proposal:
  - Checkbox container class: `opacity-65 cursor-not-allowed`
  - Checkbox input / button `disabled` attribute: `true`
  - Clicking on the button MUST NOT execute `toggleLahan(lahan.id)`
  - Render description:
    ```html
    <span class="text-[10px] text-amber-600 bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded-full font-medium ml-2">
      Sedang diajukan di {{ proposal.nomorResi }}
    </span>
    ```

### 2. Pekebun Card & Header
- **Condition**: If `isPekebunDisabled(pekebun)` returns `true`:
  - Card wrapper class: `opacity-60 cursor-not-allowed bg-slate-50 border-slate-200`
  - Header button `disabled` attribute: `true`
  - Clicking on the header button MUST NOT execute `togglePekebun(pekebun.id)`
  - Render message under NIK:
    ```html
    <p class="text-[10px] text-amber-600 font-semibold mt-0.5">
      Seluruh lahan pekebun ini sedang diajukan dalam proposal lain
    </p>
    ```
