import { zodResolver } from '@hookform/resolvers/zod';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { useDispatch } from 'react-redux';

import { useCreateGameMutation } from '@/apis/gamesApi';
import { Button } from '@/components/atoms/Button';
import { NewGameDialog } from '@/components/dialogs/NewGameDialog';
import { SettingRow } from '@/components/molecules/SettingRow';
import { PresetToggle } from '@/components/organisms/PresetToggle';
import { DEFAULT_SETTINGS_FORM_VALUES, Preset } from '@/constants';
import { clearSelectedPreset } from '@/states/presetsSlice';
import { setLastUsername } from '@/states/usernameSlice';
import { getApiErrorMessage } from '@/types/errors';
import type { Game } from '@/types/game';
import { createFormSchema, formValuesToRequest } from '@/utils/validation';
import { BackendError, Form } from './SettingsForm.styles';

export interface SettingsFormValues {
  userName: string;
  cardCount: number;
  countdownSeconds: number;
  flipBackDelayMs: number;
  maxBadGuesses: string;
}

export interface SettingsFormProps {
  initialValues?: Partial<SettingsFormValues>;
  onSuccess: (game: Game) => void;
  submitLabel?: string;
  gameId?: string;
}

type FormFieldConfig = {
  name: keyof SettingsFormValues;
  label: string;
  type: 'text' | 'number';
  placeholder?: string;
  wide?: boolean;
};

const FORM_FIELDS: FormFieldConfig[] = [
  { name: 'userName', label: 'Your name', type: 'text', placeholder: 'Name', wide: true },
  { name: 'cardCount', label: 'Number of pairs', type: 'number' },
  { name: 'countdownSeconds', label: 'Countdown time (sec.)', type: 'number' },
  { name: 'flipBackDelayMs', label: 'Flip-back delay (ms)', type: 'number' },
  { name: 'maxBadGuesses', label: 'Max bad guesses', type: 'text', placeholder: '—' },
];

export const SettingsForm = memo<SettingsFormProps>(({
  initialValues,
  onSuccess,
  submitLabel = 'Start game',
  gameId,
}: SettingsFormProps) => {
  const dispatch = useDispatch();
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const pendingCreateRef = useRef<{ userName: string; formData: SettingsFormValues } | null>(null);
  const [createGame, { isLoading, error: apiError, reset: resetMutation }] = useCreateGameMutation();

  const defaultValues = useMemo(
    () => ({ ...DEFAULT_SETTINGS_FORM_VALUES, ...initialValues }),
    [initialValues]
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(createFormSchema) as Resolver<SettingsFormValues>,
    defaultValues,
    mode: 'onSubmit',
  });

  // Sync form with external initialValues changes
  useEffect(() => {
    if (initialValues) {
      reset({ ...DEFAULT_SETTINGS_FORM_VALUES, ...initialValues });
    }
  }, [initialValues, reset]);

  const isEditingGame = useMemo(
    () => initialValues != null && gameId != null,
    [initialValues, gameId]
  );

  const handleFieldChange = useCallback(() => {
    dispatch(clearSelectedPreset());
    resetMutation();
  }, [dispatch, resetMutation]);

  const handlePresetApply = useCallback(
    (preset: Preset) => {
      Object.entries(preset).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'label') {
          setValue(key as keyof SettingsFormValues, value, {
            shouldValidate: false,
            shouldDirty: true,
          });
        }
      });
      resetMutation();
    },
    [setValue, resetMutation]
  );

  const onFormSubmit = useCallback(
    async (formData: SettingsFormValues) => {
      const userName = formData.userName.trim();

      // Editing game - confirm restart
      if (isEditingGame) {
        pendingCreateRef.current = { userName, formData };
        setShowRestartConfirm(true);
        return;
      }

      // Create new game
      try {
        const result = await createGame(formValuesToRequest(formData));
        if ('data' in result && result.data) {
          dispatch(setLastUsername(userName));
          onSuccess(result.data);
        }
      } catch {
        /* apiError from mutation is displayed below */
      }
    },
    [isEditingGame, createGame, onSuccess, dispatch]
  );

  const handleRestartConfirm = useCallback(async () => {
    const pending = pendingCreateRef.current;
    if (!pending) {
      return;
    }

    try {
      const result = await createGame(formValuesToRequest(pending.formData));
      setShowRestartConfirm(false);
      pendingCreateRef.current = null;
      if ('data' in result && result.data) {
        dispatch(setLastUsername(pending.userName));
        onSuccess(result.data);
      }
    } catch {
      setShowRestartConfirm(false);
    }
  }, [createGame, onSuccess, dispatch]);

  const handleRestartClose = useCallback(() => {
    pendingCreateRef.current = null;
    setShowRestartConfirm(false);
  }, []);

  const hasChanges = initialValues == null || isDirty;
  const buttonDisabled = (!hasChanges || isLoading) && isEditingGame;

  return (
    <Form onSubmit={handleSubmit(onFormSubmit)} noValidate>
      <PresetToggle onPresetApply={handlePresetApply} />

      {FORM_FIELDS.map((fieldConfig) => (
        <Controller
          key={fieldConfig.name}
          name={fieldConfig.name}
          control={control}
          render={({ field }) => (
            <SettingRow
              label={fieldConfig.label}
              type={fieldConfig.type}
              value={field.value}
              onChange={(target) => {
                const newValue = fieldConfig.type === 'number' ? target.valueAsNumber : target.value;
                field.onChange(newValue);
                if (fieldConfig.name !== 'userName') {
                  handleFieldChange();
                }
              }}
              error={errors[fieldConfig.name]?.message}
              placeholder={fieldConfig.placeholder}
              wide={fieldConfig.wide}
            />
          )}
        />
      ))}

      {apiError ? (
        <BackendError role="alert">
          {getApiErrorMessage(apiError)}
        </BackendError>
      ) : null}

      <Button primary disabled={buttonDisabled} type="submit">
        {submitLabel}
      </Button>

      <NewGameDialog
        isOpen={showRestartConfirm}
        onClose={handleRestartClose}
        onConfirm={handleRestartConfirm}
      />
    </Form>
  );
});
