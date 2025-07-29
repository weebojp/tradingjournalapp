import { useState, useCallback } from 'react';

export interface LoadingStep {
  id: string;
  label: string;
  progress: number; // 0-100
  status: 'pending' | 'loading' | 'completed' | 'error';
  error?: string;
}

export interface LoadingState {
  isLoading: boolean;
  steps: LoadingStep[];
  currentStep: number;
  overallProgress: number;
  estimatedTimeRemaining?: number;
}

export const useLoadingState = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    steps: [],
    currentStep: 0,
    overallProgress: 0
  });

  const startLoading = useCallback((steps: Omit<LoadingStep, 'progress' | 'status'>[]) => {
    const initialSteps: LoadingStep[] = steps.map(step => ({
      ...step,
      progress: 0,
      status: 'pending'
    }));

    setLoadingState({
      isLoading: true,
      steps: initialSteps,
      currentStep: 0,
      overallProgress: 0
    });
  }, []);

  const updateStepProgress = useCallback((stepId: string, progress: number, status?: LoadingStep['status']) => {
    setLoadingState(prev => {
      const newSteps = prev.steps.map(step => {
        if (step.id === stepId) {
          return {
            ...step,
            progress: Math.min(100, Math.max(0, progress)),
            status: status || (progress === 100 ? 'completed' : 'loading')
          };
        }
        return step;
      });

      // Calculate overall progress
      const totalProgress = newSteps.reduce((sum, step) => sum + step.progress, 0);
      const overallProgress = newSteps.length > 0 ? totalProgress / newSteps.length : 0;

      // Find current step (first non-completed step)
      const currentStepIndex = newSteps.findIndex(step => step.status !== 'completed');
      
      return {
        ...prev,
        steps: newSteps,
        currentStep: currentStepIndex >= 0 ? currentStepIndex : newSteps.length - 1,
        overallProgress
      };
    });
  }, []);

  const setStepError = useCallback((stepId: string, error: string) => {
    setLoadingState(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId 
          ? { ...step, status: 'error', error }
          : step
      )
    }));
  }, []);

  const completeLoading = useCallback(() => {
    setLoadingState(prev => ({
      ...prev,
      isLoading: false,
      overallProgress: 100,
      steps: prev.steps.map(step => ({ ...step, progress: 100, status: 'completed' }))
    }));
  }, []);

  const resetLoading = useCallback(() => {
    setLoadingState({
      isLoading: false,
      steps: [],
      currentStep: 0,
      overallProgress: 0
    });
  }, []);

  return {
    loadingState,
    startLoading,
    updateStepProgress,
    setStepError,
    completeLoading,
    resetLoading
  };
};