export function GradientButton(props: any) { return <button {...props} className={["gradient-button", props.className].filter(Boolean).join(" ")} />; }
