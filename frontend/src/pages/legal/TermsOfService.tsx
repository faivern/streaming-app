// src/pages/legal/TermsOfService.tsx
// IMPORTANT: This is a placeholder. The final content MUST be reviewed and approved
// by a qualified legal professional to ensure legal validity and compliance.

import { Link } from "react-router-dom";

export default function TermsOfService() {
  return (
    <main className="min-h-dvh bg-background mt-navbar-offset">
      <article className="max-w-4xl mx-auto px-page py-8 text-gray-300">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-text-h1 mb-4">Terms of Service</h1>
          <p className="text-gray-400">
            Last updated: <time dateTime="2026-02-04">February 4, 2026</time>
          </p>
        </header>

        {/* Introduction */}
        <section className="mb-10">
          <p className="leading-relaxed">
            Welcome to Cinelas. These Terms of Service ("Terms") govern your use of the
            Cinelas application and services. By accessing or using Cinelas, you agree
            to be bound by these Terms. If you do not agree to these Terms, please do not use
            the service.
          </p>
        </section>

        {/* User Agreement */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-text-h1 mb-4">1. Acceptance of Terms</h2>
          <p className="leading-relaxed">
            By creating an account or using Cinelas, you acknowledge that you have read,
            understood, and agree to be bound by these Terms of Service and our{" "}
            <Link to="/privacy-policy" className="text-accent-primary hover:underline">
              Privacy Policy
            </Link>
            . If you are using the service on behalf of an organization, you agree to these
            Terms on behalf of that organization.
          </p>
          {/* TODO: Insert lawyer-approved "Acceptance of Terms" clause here */}
        </section>

        {/* Description of Service */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-text-h1 mb-4">2. Description of Service</h2>
          <p className="leading-relaxed">
            Cinelas is a movie and TV show discovery application that allows users to:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
            <li>Browse and discover movies and TV shows</li>
            <li>Create and manage personal watchlists</li>
            <li>View streaming availability information</li>
            <li>Track watched content</li>
          </ul>
          <p className="leading-relaxed mt-4">
            Movie and TV show data is provided by The Movie Database (TMDB). Streaming
            availability data is provided by JustWatch.
          </p>
          {/* TODO: Insert lawyer-approved "Service Description" clause here */}
        </section>

        {/* User Accounts */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-text-h1 mb-4">3. User Accounts</h2>
          <p className="leading-relaxed mb-4">
            To access certain features of Cinelas, you must create an account using Google
            Authentication. You are responsible for:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Maintaining the confidentiality of your account</li>
            <li>All activities that occur under your account</li>
            <li>Notifying us immediately of any unauthorized use</li>
          </ul>
          {/* TODO: Insert lawyer-approved "User Accounts" clause here */}
        </section>

        {/* User Conduct */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-text-h1 mb-4">4. User Conduct</h2>
          <p className="leading-relaxed mb-4">
            You agree not to use Cinelas to:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on the rights of others</li>
            <li>Attempt to gain unauthorized access to the service or its systems</li>
            <li>Interfere with or disrupt the service</li>
            <li>Upload malicious code or content</li>
            <li>Use automated systems to access the service without permission</li>
            <li>Collect user data without consent</li>
          </ul>
          {/* TODO: Insert lawyer-approved "Prohibited Activities" clause here */}
        </section>

        {/* Intellectual Property */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-text-h1 mb-4">5. Intellectual Property</h2>
          <p className="leading-relaxed">
            The Cinelas service, including its original content, features, and functionality,
            is owned by Cinelas and is protected by international copyright, trademark, and
            other intellectual property laws. Movie and TV show data, images, and metadata are
            provided by TMDB and are subject to their terms of use.
          </p>
          {/* TODO: Insert lawyer-approved "Intellectual Property" clause here */}
        </section>

        {/* Account Termination */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-text-h1 mb-4">6. Account Termination</h2>
          <p className="leading-relaxed mb-4">
            <strong>By You:</strong> You may delete your account at any time through the
            application settings or by contacting us. Upon deletion, your personal data will
            be removed from our systems.
          </p>
          <p className="leading-relaxed">
            <strong>By Us:</strong> We reserve the right to suspend or terminate your account
            at any time, without prior notice, for conduct that we believe violates these Terms
            or is harmful to other users, us, or third parties, or for any other reason at our
            sole discretion.
          </p>
          {/* TODO: Insert lawyer-approved "Termination" clause here */}
        </section>

        {/* Disclaimer of Warranties */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-text-h1 mb-4">7. Disclaimer of Warranties</h2>
          <p className="leading-relaxed uppercase text-sm">
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
            EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF
            MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT
            WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY SECURE.
          </p>
          <p className="leading-relaxed mt-4">
            We do not guarantee the accuracy, completeness, or timeliness of movie/TV show data
            or streaming availability information, as this data is provided by third-party services.
          </p>
          {/* TODO: Insert lawyer-approved "Disclaimer" clause here */}
        </section>

        {/* Limitation of Liability */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-text-h1 mb-4">8. Limitation of Liability</h2>
          <p className="leading-relaxed uppercase text-sm">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, CINELAS AND ITS OPERATORS SHALL NOT BE
            LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
            OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY
            LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM YOUR USE OF
            THE SERVICE.
          </p>
          {/* TODO: Insert lawyer-approved "Limitation of Liability" clause here */}
        </section>

        {/* Indemnification */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-text-h1 mb-4">9. Indemnification</h2>
          <p className="leading-relaxed">
            You agree to indemnify and hold harmless Cinelas and its operators from any
            claims, damages, losses, liabilities, and expenses (including legal fees) arising
            out of your use of the service or violation of these Terms.
          </p>
          {/* TODO: Insert lawyer-approved "Indemnification" clause here */}
        </section>

        {/* Governing Law */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-text-h1 mb-4">10. Governing Law</h2>
          <p className="leading-relaxed">
            These Terms shall be governed by and construed in accordance with the laws of{" "}
            <span className="text-accent-primary">[INSERT JURISDICTION]</span>, without regard
            to its conflict of law provisions.
          </p>
          {/* TODO: Insert lawyer-approved "Governing Law" clause with actual jurisdiction */}
        </section>

        {/* Changes to Terms */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-text-h1 mb-4">11. Changes to Terms</h2>
          <p className="leading-relaxed">
            We reserve the right to modify these Terms at any time. We will notify users of any
            material changes by posting the new Terms on this page and updating the "Last updated"
            date. Your continued use of the service after such modifications constitutes your
            acceptance of the updated Terms.
          </p>
          {/* TODO: Insert lawyer-approved "Changes to Terms" clause here */}
        </section>

        {/* Contact */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-text-h1 mb-4">12. Contact Us</h2>
          <p className="leading-relaxed">
            If you have any questions about these Terms of Service, please contact us at:{" "}
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
