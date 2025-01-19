export const NOTES: Record<
  string,
  { frequency: number; color: string; name: string }
> = {
  A: { frequency: 440.00, color: "#FF0000", name: "A red" }, // Red
  S: { frequency: 493.88, color: "#00FF00", name: "S green" }, // Green
  D: { frequency: 523.25, color: "#0000FF", name: "D blue" }, // Blue
  F: { frequency: 587.33, color: "#FFD700", name: "F yellow" }, // Yellow
  G: { frequency: 659.25, color: "#FF69B4", name: "G pink" }, // Pink
};

export const INITIAL_TIME_WINDOW = 3000; // 3 seconds
export const MIN_TIME_WINDOW = 800; // Minimum time window in milliseconds
export const TIME_WINDOW_DECREASE = 200; // How much to decrease time window per level
export const POINTS_PER_NOTE = 10;
export const LEVEL_THRESHOLD = 100; // Points needed to advance to next level
