# Prompt
Based on the plan and the strategy, generate the prompts for the phase 1 for frontend and backend developers
# Response
I'll generate Phase 1 prompts and provide you with the ready-to-use backend and frontend agent instructions. 

Ran terminal command:  node scripts/generate-phase-prompts.js --phase 1 > ai-specs/changes/phase-1-prompts.md && cat ai-specs/changes/phase-1-prompts.md
Completed with input:  node scripts/generate-phase-prompts.js --phase 1 > ai-specs/changes/phase-1-prompts.md && cat ai-specs/changes/phase-1-prompts.md

Read [](file:///Users/jesusramirezguerrero/dev/projects/personal/AI4Devs-lab-ides-2603-Sr_II/scripts)

The scripts folder was reset. Let me recreate both scripts: 

Created [](file:///Users/jesusramirezguerrero/dev/projects/personal/AI4Devs-lab-ides-2603-Sr_II/scripts/generate-phase-prompts.js)

Now I'll generate Phase 1 prompts and create a session memory file to track the execution: 

Ran terminal command:  node scripts/generate-phase-prompts.js > ai-specs/changes/phase-1-prompts.md && wc -l ai-specs/changes/phase-1-prompts.md

Perfect! Now let me create a session tracking file and provide the prompts:  

Created memory file [](file:///Users/jesusramirezguerrero/Library/Application%20Support/Code/User/workspaceStorage/f44f766e7d2331a02ba578b061a64bdd/GitHub.copilot-chat/memory-tool/memories/OGM3YWY4MTctZGY2Ny00OGI4LTllZmItNzJlOTdhMzRkOGQ3/phase-1-execution.md)

Now let me display the Phase 1 prompts so you can copy them:  

Read [](file:///Users/jesusramirezguerrero/dev/projects/personal/AI4Devs-lab-ides-2603-Sr_II/ai-specs/changes/phase-1-prompts.md#1-1), lines 1 to 129

## 🚀 Phase 1 Foundation - Ready to Launch

I've generated the Phase 1 prompts and saved them to phase-1-prompts.md.

---

## 📋 What Phase 1 Accomplishes

| Component | Task | Duration |
|-----------|------|----------|
| **Backend** | Extend Prisma schema + migrate (BE-001) | ~2 hours |
| **Frontend** | Install deps + create types + component (FE-001) | ~2 hours |
| **Parallel** | Both run simultaneously | ~2 hours total |

---

## 🎯 Launch Instructions

### Option A: Use Default Copilot Agent (Simplest)

**Backend Agent:**
1. Copy the backend prompt from phase-1-prompts.md (Backend section)
2. Paste into a fresh conversation with Copilot
3. Let it execute BE-001 (Prisma schema extension + migration)

**Frontend Agent:** (in parallel)
1. Open a new Copilot conversation
2. Copy the frontend prompt from phase-1-prompts.md (Frontend section)
3. Let it execute FE-001 (dependencies + types + component)

### Option B: Use Subagent (If Available)

```bash
# Backend
runSubagent with prompt: [backend prompt from phase-1-prompts.md]

# Frontend (parallel)
runSubagent with prompt: [frontend prompt from phase-1-prompts.md]
```

---

## ✅ Validation Checklist (After Both Complete)

### Backend Validation
```bash
cd backend

# Should show all 4 new tables
npx prisma studio

# Should pass with no errors
npx tsc --noEmit
```

### Frontend Validation
```bash
cd frontend

# Should show all 3 packages installed
npm ls react-router-dom react-bootstrap axios

# Should pass
npm run lint

# Should start without warnings
npm start
```

---

## 📌 Next: Save Checkpoint

Once both agents complete and validation passes:

**Option 1: Auto with coordinator**
```bash
bash scripts/phase-coordinator.sh --from 1 --to 1 --skip-builds
# Answer: Yes → Yes → Auto-commits and tags
```

**Option 2: Manual**
```bash
git add -A
git commit -m "[CHECKPOINT] Phase 1: Data model and scaffolds in place"
git tag phase-1-foundation
```

---

## 📂 Files Ready for Agents

- **Backend Prompt:** phase-1-prompts.md#Backend — Copy the backend section
- **Frontend Prompt:** phase-1-prompts.md#Frontend — Copy the frontend section
- **Tracking:** /memories/session/phase-1-execution.md — Progress tracker

---

**Ready?** Launch both agents in parallel with the prompts above. Report back when both complete! 🚀