interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Memuat..." }: LoadingStateProps) {
  return (
    <p className="text-sm text-text-muted">{message}</p>
  );
}
