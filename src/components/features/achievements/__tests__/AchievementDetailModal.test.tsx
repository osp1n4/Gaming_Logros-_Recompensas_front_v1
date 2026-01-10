import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { AchievementDetailModal } from '../AchievementDetailModal';

describe('AchievementDetailModal', () => {
  const mockAchievement = {
    id: '1',
    name: 'Monster Slayer',
    description: 'Defeat 10 monsters to prove your strength',
    type: 'kill',
    completed: false,
    progress: 45,
  };

  const mockProps = {
    achievement: mockAchievement,
    isOpen: true,
    onClose: vi.fn(),
  };

  test('muestra información básica del achievement', () => {
    render(<AchievementDetailModal {...mockProps} />);
    
    expect(screen.getByText('Monster Slayer')).toBeInTheDocument();
    expect(screen.getByText('Defeat 10 monsters to prove your strength')).toBeInTheDocument();
    expect(screen.getByText('45% Complete')).toBeInTheDocument();
  });

  test('muestra tipo de achievement', () => {
    render(<AchievementDetailModal {...mockProps} />);
    
    expect(screen.getByText('kill')).toBeInTheDocument();
  });

  test('muestra estado correcto (completed/in progress)', () => {
    render(<AchievementDetailModal {...mockProps} />);
    
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  test('no se renderiza cuando isOpen es false', () => {
    render(<AchievementDetailModal {...mockProps} isOpen={false} />);
    
    expect(screen.queryByText('Monster Slayer')).not.toBeInTheDocument();
  });

  test('muestra achievement completado', () => {
    const completedAchievement = {
      ...mockAchievement,
      completed: true,
      progress: 100,
    };

    render(<AchievementDetailModal {...mockProps} achievement={completedAchievement} />);
    
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  test('muestra icono apropiado según tipo', () => {
    render(<AchievementDetailModal {...mockProps} />);
    
    // El icono se muestra como texto en material-symbols-outlined
    expect(screen.getByText('psychology')).toBeInTheDocument(); // icono para tipo 'kill'
  });

  test('llama onClose cuando se hace click en botón close', () => {
    const onCloseMock = vi.fn();
    render(<AchievementDetailModal {...mockProps} onClose={onCloseMock} />);
    
    const closeButton = screen.getByText('Close');
    closeButton.click();
    
    expect(onCloseMock).toHaveBeenCalled();
  });
});