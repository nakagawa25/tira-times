/** Pelada — componentes do app de sorteio de times. Global: window.Pelada */
export type Position = 'GOL' | 'DEF' | 'ALA' | 'MEI' | 'ATA' | 'QQ';
export type TeamColor = 'verde' | 'azul' | 'laranja' | 'grafite' | 'vermelho' | 'amarelo';
export interface Player { id: string; name: string; positions: Position[]; monthly: boolean; skills: { attack: number; defense: number; speed: number; skill: number } }
export interface Rules { linePerTeam: number; teams: number; goalkeepers: 'fixed' | 'perTeam'; balance?: boolean; monthlyPriority?: boolean }

export interface ButtonProps { variant?: 'primary' | 'tonal' | 'outline' | 'ghost' | 'danger' | 'fab'; size?: 'md' | 'lg'; block?: boolean; icon?: string; disabled?: boolean; onClick?: () => void; children?: React.ReactNode }
export interface BadgeProps { tone?: 'monthly' | 'guest' | 'gk' | 'warn' | 'neutral'; icon?: string; children?: React.ReactNode }
export interface TextFieldProps { label?: string; placeholder?: string; icon?: string; hint?: string; value?: string; defaultValue?: string; autoFocus?: boolean; onChange?: (v: string) => void }
export interface StarRatingProps { label: string; icon?: string; value?: number; defaultValue?: number; readOnly?: boolean; onChange?: (v: number) => void }
export interface PositionPickerProps { value?: Position[]; defaultValue?: Position[]; onChange?: (v: Position[]) => void }
export interface MonthlySwitchProps { checked?: boolean; defaultChecked?: boolean; label?: string; hint?: string; icon?: string; onChange?: (v: boolean) => void }
export interface PlayerRowProps { name: string; positions?: Position[]; monthly?: boolean; rating?: number; mode?: 'list' | 'attendance'; present?: boolean; onToggle?: () => void; onClick?: () => void }
export interface StepperProps { label: string; hint?: string; value?: number; defaultValue?: number; min?: number; max?: number; onChange?: (v: number) => void }
export interface TeamCardProps { name?: string; color?: TeamColor; players: Player[]; goalkeeper?: string | null; missing?: number }
export interface AppBarProps { title: string; subtitle?: string; large?: boolean; onBack?: (() => void) | null; actions?: { icon: string; label: string; onClick?: () => void }[] }
export interface BottomNavProps { active?: string; defaultValue?: string; items?: { id: string; icon: string; label: string; badge?: number }[]; onChange?: (id: string) => void }

export declare function planSummary(players: Player[], rules: Rules): { goal: { mode: string; fixed: number; rotating: number }; line: number; full: number; partial: { size: number; missing: number }[]; bench: number };
export declare function drawTeams(players: Player[], rules: Rules, seed?: number): { teams: (TeamCardProps & { missing: number })[]; goalkeepers: Player[]; rotating: number; mode: string; bench: Player[] };
