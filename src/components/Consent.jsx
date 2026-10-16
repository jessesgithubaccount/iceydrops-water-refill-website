export default function Consent({ action }) {
  return (
    <p className="consent">
      By {action} you agree to our{" "}
      <a href="#/terms" target="_blank" rel="noopener">
        Terms of Service
      </a>{" "}
      and{" "}
      <a href="#/privacy" target="_blank" rel="noopener">
        Privacy Policy
      </a>
      .
    </p>
  );
}
