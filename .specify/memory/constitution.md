<!--
Sync Impact Report
==================
Version change: N/A → 1.0.0 (initial ratification)
Modified principles: N/A (first version)
Added sections:
  - Core Principles (I. Local-Only Storage, II. Expo Go Compatibility,
    III. Native StyleSheet Only, IV. Simplicity for Portfolio Clarity,
    V. TypeScript-Typed Components)
  - Technology Stack & Constraints
  - Development Workflow
  - Governance
Removed sections: N/A (first version)
Templates requiring updates:
  - .specify/templates/plan-template.md: ⚠ pending manual check (not inspected this run)
  - .specify/templates/spec-template.md: ⚠ pending manual check (not inspected this run)
  - .specify/templates/tasks-template.md: ⚠ pending manual check (not inspected this run)
Follow-up TODOs: none
-->

# Calorie Tracker Constitution

## Core Principles

### I. Local-Only Storage (No Backend)
The app MUST NOT depend on any backend server, remote API, or remote database.
All persistence MUST use on-device storage via `AsyncStorage` (or a thin wrapper
around it). Features MUST be designed assuming there is no network connectivity
and no server-side source of truth. Any future need for sync, auth, or remote
data MUST be treated as an explicit, separately justified change to this
constitution rather than an incidental addition.
**Rationale**: This is a portfolio project meant to demonstrate self-contained
front-end engineering skill. A backend adds infrastructure cost, deployment
surface, and complexity that is irrelevant to the app's purpose and would
distract from showcasing clean React Native code.

### II. Expo Go Compatibility
The app MUST run entirely inside standard Expo Go, with no custom dev client
and no custom native (iOS/Android) code. Only Expo SDK APIs and pure
JavaScript/TypeScript libraries with no native build step MAY be added.
Before adding any dependency, its Expo Go compatibility MUST be verified;
libraries that require `expo prebuild`, custom native modules, or a
`dev-client` build MUST be rejected in favor of an Expo Go-compatible
alternative.
**Rationale**: Keeping the project runnable via `npx expo start` and the
Expo Go app maximizes reviewability for anyone evaluating the portfolio —
no native toolchain, signing, or build setup is required to try it.

### III. Native StyleSheet Only
All styling MUST use React Native's built-in `StyleSheet.create` API (or
inline style objects following the same shape). CSS-in-JS libraries,
utility-class systems (e.g., NativeWind/Tailwind), and styled-components-style
libraries MUST NOT be used.
**Rationale**: Demonstrating fluency with React Native's native styling model,
without a styling library doing the work, is part of what the portfolio is
meant to show.

### IV. Simplicity for Portfolio Clarity
Code MUST prioritize readability and directness over premature abstraction,
generic frameworks, or speculative extensibility. Prefer a straightforward
component or function over a configurable abstraction until at least two
concrete call sites justify it. Every file should be understandable on its
own by a reviewer skimming the codebase.
**Rationale**: The primary audience for this code is a human reviewer (e.g.,
a recruiter or hiring engineer) rather than a long-lived team maintaining the
system at scale. Clever or over-engineered abstractions reduce the
portfolio's effectiveness even if they would be defensible in a larger app.

### V. TypeScript-Typed Components
All components, hooks, and modules MUST be written in TypeScript. Props,
state, and function signatures MUST be explicitly typed; `any` MUST be
avoided except where a well-documented, narrow justification exists.
**Rationale**: Explicit typing is both a correctness aid and a portfolio
signal of professional React Native practice.

## Technology Stack & Constraints

The app is built with React Native and Expo (managed workflow). Persistence
uses `AsyncStorage` exclusively — no SQLite, no remote databases, no
third-party backend-as-a-service. Navigation, state management, and any other
libraries MUST be Expo Go-compatible and MUST NOT require native linking
outside of what Expo Go already provides. Styling MUST use React Native's
`StyleSheet` API per Principle III. New dependencies MUST be evaluated against
Principles I–III before being added.

## Development Workflow

Because this is a single-purpose portfolio app, process overhead is kept
minimal but not absent: before merging a change, the author MUST confirm it
runs in Expo Go, MUST confirm it introduces no backend/remote dependency, and
MUST confirm new UI uses `StyleSheet` rather than a styling library. Code
should read cleanly enough that no additional documentation is required to
understand a component's purpose; if a comment is needed to explain *what*
code does (rather than a non-obvious *why*), the code should be simplified
instead.

## Governance

This constitution supersedes any ad hoc practice or prior convention when
they conflict. Amendments require: (1) a documented rationale for the change,
(2) an update to the version number following semantic versioning (MAJOR for
backward-incompatible principle removal/redefinition, MINOR for new principles
or materially expanded guidance, PATCH for clarifications and wording), and
(3) an update to `Last Amended`. All feature work MUST be checked for
compliance with the Core Principles above before being considered complete;
any deviation MUST be justified in writing in the relevant spec/plan and, if
recurring, folded back into this document via an amendment.

**Version**: 1.0.0 | **Ratified**: 2026-08-26 | **Last Amended**: 2026-08-26
