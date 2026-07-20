// src/pages/legal/PrivacyPolicy.tsx
// IMPORTANT: This is a placeholder. The final content MUST be reviewed and approved
// by a qualified legal professional to ensure compliance with GDPR, CCPA, and other regulations.

import { Link } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import { Trash2 } from "lucide-react";
import { useUser } from "../../hooks/user/useUser";
import DeleteAccountButton from "../../components/auth/DeleteAccountButton";

export default function PrivacyPolicy() {
  const { data: user } = useUser();

  return (
    <main className="min-h-dvh bg-background mt-navbar-offset">
      <Helmet>
        <title>Privacy Policy | Cinelas</title>
        <meta name="description" content="Cinelas privacy policy. Learn how we handle your data." />
        <link rel="canonical" href="https://cinelas.com/privacy-policy" />
        <meta property="og:title" content="Privacy Policy | Cinelas" />
        <meta property="og:description" content="Cinelas privacy policy. Learn how we handle your data." />
        <meta property="og:url" content="https://cinelas.com/privacy-policy" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <article className="max-w-4xl mx-auto px-page py-8 text-gray-300">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-text-h1 mb-4">Privacy Policy</h1>
          <p className="text-gray-400">
            Last updated: <time dateTime="2026-07-20">July 20, 2026</time>
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
          <p className="leading-relaxed mt-4 mb-4">
            As you use Cinelas, we also store the content you create in the app,
            linked to your account:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Lists</strong> — Names, descriptions, and the movies or shows you add to them</li>
            <li><strong>Ratings & watch status</strong> — Titles you mark as watched or to-watch and any ratings you give them</li>
            <li><strong>Reviews</strong> — Any review text you write for a title</li>
            <li><strong>AI Discover searches</strong> — The search text you enter in AI Discover and the results returned, used to provide and improve the feature</li>
          </ul>
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
        </section>

        {/* Data Storage & Security */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-text-h1 mb-4">3. Data Storage & Security</h2>
          <p className="leading-relaxed">
            Your data is stored securely using industry-standard security measures. We implement
            appropriate technical and organizational measures to protect your personal information
            against unauthorized access, alteration, disclosure, or destruction.
          </p>
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
            <li>
              <strong>Microsoft Azure OpenAI</strong> — Powers the AI Discover
              feature. When you use AI Discover, the search text you enter is
              sent to Azure OpenAI to generate results. See{" "}
              <a
                href="https://learn.microsoft.com/en-us/legal/cognitive-services/openai/data-privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-primary hover:underline"
              >
                Azure OpenAI's data & privacy documentation
              </a>
            </li>
          </ul>
        </section>

        {/* Cookies */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-text-h1 mb-4">5. Cookies</h2>
          <p className="leading-relaxed mb-4">
            We use essential cookies to manage user sessions and keep you logged in. These
            cookies are necessary for the application to function properly and cannot be
            disabled. We do not use tracking cookies or third-party advertising cookies.
          </p>
          <p className="leading-relaxed mb-4">
            We also store a small amount of data in your browser's local storage to
            remember your preferences and improve your experience. This data stays on
            your device and is never used to track you:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>cinelas-theme</strong> — Your selected colour theme</li>
            <li><strong>watch-providers-region</strong> — Your selected region for streaming availability</li>
            <li><strong>ai-discover-session</strong> — Temporary AI Discover session state</li>
            <li><strong>ai-discover-cta-dismiss</strong> — Remembers if you dismissed the AI Discover prompt</li>
            <li><strong>cinelas-cookie-consent</strong> — Remembers that you acknowledged this cookie notice</li>
          </ul>
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
            <li>
              <strong>Deletion</strong> — You can permanently delete your account and all
              associated data at any time using the <strong>"Delete account"</strong> button
              below. This immediately removes your profile, lists, ratings, reviews, and
              AI Discover search history and cannot be undone.
            </li>
            <li><strong>Portability</strong> — You can request your data in a machine-readable format</li>
          </ul>

          {user ? (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/5 p-5">
              <h3 className="text-lg font-semibold text-text-h1 mb-2">Delete your account</h3>
              <p className="text-sm text-subtle leading-relaxed mb-4">
                Signed in as <strong className="text-text-h1">{user.email ?? user.name}</strong>.
                Permanently delete your account and all associated data. This action
                cannot be undone.
              </p>
              <DeleteAccountButton className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 min-h-[44px] rounded-full transition-colors">
                <Trash2 className="w-4 h-4" />
                Delete account
              </DeleteAccountButton>
            </div>
          ) : (
            <p className="leading-relaxed mt-6 text-sm text-subtle">
              Sign in to delete your account and data directly from this page.
            </p>
          )}

          <p className="leading-relaxed mt-4">
            For any other request, or if you can no longer access your account,
            please contact us at{" "}
            <a href="mailto:cinelas.support@gmail.com" className="text-accent-primary hover:underline">cinelas.support@gmail.com</a>.
          </p>
        </section>

        {/* Changes to Policy */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-text-h1 mb-4">7. Changes to This Policy</h2>
          <p className="leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of any
            changes by posting the new Privacy Policy on this page and updating the "Last
            updated" date.
          </p>
        </section>

        {/* Contact */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-text-h1 mb-4">8. Contact Us</h2>
          <p className="leading-relaxed">
            If you have any questions about this Privacy Policy, please contact us at:{" "}
            <a href="mailto:cinelas.support@gmail.com" className="text-accent-primary hover:underline">cinelas.support@gmail.com</a>
          </p>
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
