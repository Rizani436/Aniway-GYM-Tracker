import { MuscleGroup, EquipmentType } from '@prisma/client';

export const MUSCLE_LABELS: Record<string, string> = {
  CHEST: 'Dada (Chest)',
  BACK: 'Punggung (Back)',
  SHOULDERS: 'Bahu (Shoulders)',
  BICEPS: 'Bisep (Biceps)',
  TRICEPS: 'Trisep (Triceps)',
  QUADS: 'Paha Depan (Quads)',
  HAMSTRINGS: 'Paha Belakang (Hamstrings)',
  GLUTES: 'Bokong (Glutes)',
  CALVES: 'Betis (Calves)',
  ABS: 'Perut (Abs)',
  FOREARMS: 'Lengan Bawah (Forearms)',
  FULL_BODY: 'Seluruh Tubuh',
};

export const EQUIPMENT_LABELS: Record<string, string> = {
  MACHINE: 'Mesin Pin / Stack',
  PLATE_LOADED: 'Mesin Plate Loaded',
  CABLE: 'Mesin Kabel (Cable)',
  SMITH_MACHINE: 'Smith Machine',
  DUMBBELL: 'Dumbbell',
  BARBELL: 'Barbell',
  BODYWEIGHT: 'Berat Badan / Assisted',
  OTHER: 'Alat Lainnya',
};

export const PROGRAM_COLORS = [
  { name: 'Emerald', value: '#10b981' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Lime', value: '#84cc16' },
];

export const WEIGHT_INCREMENT_OPTIONS = [1, 1.25, 2, 2.5, 5, 7, 10];

export const MUSCLE_TRANSLATIONS = MUSCLE_LABELS;
export const EQUIPMENT_TRANSLATIONS = EQUIPMENT_LABELS;

