// src/pages/legal/PrivacyPolicy.tsx
// IMPORTANT: This is a placeholder. The final content MUST be reviewed and approved
// by a qualified legal professional to ensure compliance with GDPR, CCPA, and other regulations.

import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <main className="min-h-dvh bg-background mt-navbar-offset">
      <article className="max-w-4xl mx-auto px-6 py-8 text-gray-300">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-text-h1 mb-4">Privacy Policy</h1>
          <p className="text-gray-400">
            Last updated: <time dateTime="2026-02-04">February 4, 2026</time>
          </p>
        </header>

        {/* Introduction */}
        <section className="mb-10">
          <p className="leading-relaxed">
            Welcome to Cinelas. This Privacy Policy explains how we collect, use, disclose,
            and safeguard your information when you use our service. Please read this policy
            carefully. By using Cinelas, you agree to the collection and use of information
            in accordance with this policy.
          </p>
        </section>

        {/* Data Collection */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-text-h1 mb-4">1. Information We Collect</h2>
          <p className="leading-relaxed mb-4">
            When you sign in using Google Authentication, we collect the following information
            from your Google account:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Google Username</strong> — Your display name from Google</li>
            <li><strong>Profile Picture URL</strong> — The URL to your Google profile picture</li>
            <li><strong>Email Address</strong> — Your Google account email</li>
          </ul>
          {/* TODO: Insert lawyer-approved "Data Collection" clause here */}
        </section>

        {/* Purpose of Data Use */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-text-h1 mb-4">2. How We Use Your Information</h2>

          <h3 className="text-xl font-semibold text-white mb-3">Primary Use</h3>
          <p className="leading-relaxed mb-4">
            We use your information to display your identity (name and profile picture) within
            the application interface to indicate that you are signed in and to personalize
            your experience.
          </p>

          <h3 className="text-xl font-semibold text-white mb-3">Future Features (Opt-In)</h3>
          <p className="leading-relaxed">
            We plan to offer email notifications for movie and TV show release reminders.
            This feature will be <strong>opt-in only</strong>. We will only send emails to
            users who explicitly consent to receive them. You can opt out at any time.
          </p>
          {/* TODO: Insert lawyer-approved "Purpose of Use" clause here */}
        </section>

        {/* Data Storage & Security */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-text-h1 mb-4">3. Data Storage & Security</h2>
          <p className="leading-relaxed">
            Your data is stored securely using industry-standard security measures. We implement
            appropriate technical and organizational measures to protect your personal information
            against unauthorized access, alteration, disclosure, or destruction.
          </p>
          {/* TODO: Insert lawyer-approved "Data Security" clause here */}
        </section>

        {/* Third-Party Services */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-text-h1 mb-4">4. Third-Party Services</h2>
          <p className="leading-relaxed mb-4">
            We use the following third-party services:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              <strong>Google OAuth 2.0</strong> — For user authentication.
              See{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-primary hover:underline"
              >
                Google's Privacy Policy
              </a>
            </li>
            <li>
              <strong>The Movie Database (TMDB)</strong> — For movie and TV show data.
              See{" "}
              <a
                href="https://www.themoviedb.org/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-primary hover:underline"
              >
                TMDB's Privacy Policy
              </a>
            </li>
            <li>
              <strong>JustWatch</strong> — For streaming availability data.
              See{" "}
              <a
                href="https://www.justwatch.com/us/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-primary hover:underline"
              >
                JustWatch's Privacy Policy
              </a>
            </li>
          </ul>
          {/* TODO: Insert lawyer-approved "Third-Party Services" clause here */}
        </section>

        {/* Cookies */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-text-h1 mb-4">5. Cookies</h2>
          <p className="leading-relaxed">
            We use essential cookies to manage user sessions and keep you logged in. These
            cookies are necessary for the application to function properly and cannot be
            disabled. We do not use tracking cookies or third-party advertising cookies.
          </p>
          {/* TODO: Insert lawyer-approved "Cookie Policy" clause here */}
        </section>

        {/* User Rights */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-text-h1 mb-4">6. Your Rights & Data Control</h2>
          <p className="leading-relaxed mb-4">
            You have the following rights regarding your personal data:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Access</strong> — You can request a copy of the data we hold about you</li>
            <li><strong>Correction</strong> — You can request correction of inaccurate data</li>
            <li><strong>Deletion</strong> — You can request deletion of your account and all associated data</li>
            <li><strong>Portability</strong> — You can request your data in a machine-readable format</li>
          </ul>
          <p className="leading-relaxed mt-4">
            To exercise any of these rights, please contact us at{" "}
            <span className="text-accent-primary">[INSERT CONTACT EMAIL]</span>.
          </p>
          {/* TODO: Insert lawyer-approved "User Rights" clause (GDPR/CCPA compliant) here */}
        </section>

        {/* Changes to Policy */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-text-h1 mb-4">7. Changes to This Policy</h2>
          <p className="leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of any
            changes by posting the new Privacy Policy on this page and updating the "Last
            updated" date.
          </p>
          {/* TODO: Insert lawyer-approved "Policy Changes" clause here */}
        </section>

        {/* Contact */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-text-h1 mb-4">8. Contact Us</h2>
          <p className="leading-relaxed">
            If you have any questions about this Privacy Policy, please contact us at:{" "}
            <span className="text-accent-primary">[INSERT CONTACT EMAIL]</span>
          </p>
          {/* TODO: Insert actual contact information here */}
        </section>

        {/* Back Link */}
        <footer className="pt-8 border-t border-gray-700">
          <Link
            to="/"
            className="text-accent-primary hover:underline inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </footer>
      </article>
    </main>
  );
}
