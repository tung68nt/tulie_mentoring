import { describe, it, expect } from 'vitest';
import {
    validateTransition,
    getNextStatuses,
    MENTORSHIP_TRANSITIONS,
    MEETING_TRANSITIONS,
    TASK_TRANSITIONS,
    MINUTES_TRANSITIONS,
} from '@/lib/state-machines';

// ─── Mentorship State Machine ────────────────────────────

describe('Mentorship State Machine', () => {
    describe('valid transitions', () => {
        it('admin can activate a pending mentorship', () => {
            const result = validateTransition(MENTORSHIP_TRANSITIONS, 'pending', 'active', 'admin');
            expect(result.valid).toBe(true);
        });

        it('program_manager can activate a pending mentorship', () => {
            const result = validateTransition(MENTORSHIP_TRANSITIONS, 'pending', 'active', 'program_manager');
            expect(result.valid).toBe(true);
        });

        it('admin can complete an active mentorship', () => {
            const result = validateTransition(MENTORSHIP_TRANSITIONS, 'active', 'completed', 'admin');
            expect(result.valid).toBe(true);
        });

        it('admin can pause an active mentorship', () => {
            const result = validateTransition(MENTORSHIP_TRANSITIONS, 'active', 'paused', 'admin');
            expect(result.valid).toBe(true);
        });

        it('admin can resume a paused mentorship', () => {
            const result = validateTransition(MENTORSHIP_TRANSITIONS, 'paused', 'active', 'admin');
            expect(result.valid).toBe(true);
        });

        it('same status is always valid (no-op)', () => {
            const result = validateTransition(MENTORSHIP_TRANSITIONS, 'active', 'active', 'mentee');
            expect(result.valid).toBe(true);
        });
    });

    describe('invalid transitions', () => {
        it('cannot go from completed to active (terminal state)', () => {
            const result = validateTransition(MENTORSHIP_TRANSITIONS, 'completed', 'active', 'admin');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('Invalid transition');
        });

        it('cannot go from cancelled to anything (terminal state)', () => {
            const result = validateTransition(MENTORSHIP_TRANSITIONS, 'cancelled', 'pending', 'admin');
            expect(result.valid).toBe(false);
        });

        it('cannot skip from pending to completed', () => {
            const result = validateTransition(MENTORSHIP_TRANSITIONS, 'pending', 'completed', 'admin');
            expect(result.valid).toBe(false);
        });

        it('mentor cannot change mentorship status', () => {
            const result = validateTransition(MENTORSHIP_TRANSITIONS, 'pending', 'active', 'mentor');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('Role "mentor" is not allowed');
        });

        it('mentee cannot change mentorship status', () => {
            const result = validateTransition(MENTORSHIP_TRANSITIONS, 'active', 'completed', 'mentee');
            expect(result.valid).toBe(false);
        });
    });

    describe('getNextStatuses', () => {
        it('admin has all valid next statuses from active', () => {
            const next = getNextStatuses(MENTORSHIP_TRANSITIONS, 'active', 'admin');
            expect(next).toContain('paused');
            expect(next).toContain('completed');
            expect(next).toContain('cancelled');
            expect(next).not.toContain('pending');
        });

        it('mentor has no next statuses (cannot change mentorship status)', () => {
            const next = getNextStatuses(MENTORSHIP_TRANSITIONS, 'active', 'mentor');
            expect(next).toHaveLength(0);
        });

        it('completed has no next statuses for anyone', () => {
            const next = getNextStatuses(MENTORSHIP_TRANSITIONS, 'completed', 'admin');
            expect(next).toHaveLength(0);
        });
    });
});

// ─── Meeting State Machine ───────────────────────────────

describe('Meeting State Machine', () => {
    it('mentor can start a scheduled meeting', () => {
        const result = validateTransition(MEETING_TRANSITIONS, 'scheduled', 'in_progress', 'mentor');
        expect(result.valid).toBe(true);
    });

    it('mentor can complete an in-progress meeting', () => {
        const result = validateTransition(MEETING_TRANSITIONS, 'in_progress', 'completed', 'mentor');
        expect(result.valid).toBe(true);
    });

    it('mentor can cancel a scheduled meeting', () => {
        const result = validateTransition(MEETING_TRANSITIONS, 'scheduled', 'cancelled', 'mentor');
        expect(result.valid).toBe(true);
    });

    it('cannot go from completed back to scheduled', () => {
        const result = validateTransition(MEETING_TRANSITIONS, 'completed', 'scheduled', 'admin');
        expect(result.valid).toBe(false);
    });

    it('mentee cannot change meeting status', () => {
        const result = validateTransition(MEETING_TRANSITIONS, 'scheduled', 'in_progress', 'mentee');
        expect(result.valid).toBe(false);
    });

    it('cannot skip from scheduled to completed', () => {
        const result = validateTransition(MEETING_TRANSITIONS, 'scheduled', 'completed', 'admin');
        expect(result.valid).toBe(false);
    });
});

// ─── Task State Machine ──────────────────────────────────

describe('Task State Machine', () => {
    it('mentee can move task from todo to doing', () => {
        const result = validateTransition(TASK_TRANSITIONS, 'todo', 'doing', 'mentee');
        expect(result.valid).toBe(true);
    });

    it('mentee can complete a task directly from todo', () => {
        const result = validateTransition(TASK_TRANSITIONS, 'todo', 'done', 'mentee');
        expect(result.valid).toBe(true);
    });

    it('mentee can reopen a done task', () => {
        const result = validateTransition(TASK_TRANSITIONS, 'done', 'todo', 'mentee');
        expect(result.valid).toBe(true);
    });

    it('mentor cannot change task status (tasks are mentee self-managed)', () => {
        const result = validateTransition(TASK_TRANSITIONS, 'todo', 'doing', 'mentor');
        expect(result.valid).toBe(false);
    });
});

// ─── Minutes State Machine ───────────────────────────────

describe('Minutes State Machine', () => {
    it('mentee can submit draft minutes', () => {
        const result = validateTransition(MINUTES_TRANSITIONS, 'draft', 'submitted', 'mentee');
        expect(result.valid).toBe(true);
    });

    it('mentor can approve submitted minutes', () => {
        const result = validateTransition(MINUTES_TRANSITIONS, 'submitted', 'approved', 'mentor');
        expect(result.valid).toBe(true);
    });

    it('mentor can return submitted minutes to draft', () => {
        const result = validateTransition(MINUTES_TRANSITIONS, 'submitted', 'draft', 'mentor');
        expect(result.valid).toBe(true);
    });

    it('mentee cannot approve minutes', () => {
        const result = validateTransition(MINUTES_TRANSITIONS, 'submitted', 'approved', 'mentee');
        expect(result.valid).toBe(false);
    });

    it('only admin can revert approved minutes', () => {
        const resultMentor = validateTransition(MINUTES_TRANSITIONS, 'approved', 'draft', 'mentor');
        const resultAdmin = validateTransition(MINUTES_TRANSITIONS, 'approved', 'draft', 'admin');
        expect(resultMentor.valid).toBe(false);
        expect(resultAdmin.valid).toBe(true);
    });
});
