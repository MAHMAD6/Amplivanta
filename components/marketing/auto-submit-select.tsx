"use client";

/**
 * A select that submits its form on change. The form still has a submit
 * button, so filtering works without JavaScript; this only saves a click.
 */
export function AutoSubmitSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} onChange={(e) => e.currentTarget.form?.requestSubmit()} />;
}
