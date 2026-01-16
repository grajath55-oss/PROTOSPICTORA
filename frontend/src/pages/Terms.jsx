import React from "react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Terms & Conditions</h1>

        <p className="text-gray-400 mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <Section title="1. Acceptance of Terms">
          By accessing or using StockPics, you agree to be bound by these Terms
          and Conditions. If you do not agree, you may not use the platform.
        </Section>

        <Section title="2. User Accounts">
          You are responsible for maintaining the confidentiality of your
          account. You agree to provide accurate information and are responsible
          for all activities under your account.
        </Section>

        <Section title="3. Content Uploads">
          You may upload only content that you own or have legal rights to.
          By uploading content, you grant StockPics a non-exclusive, worldwide
          license to host, display, distribute, and sell the content.
        </Section>

        <Section title="4. Image Purchases & Licensing">
          All images are licensed, not sold. Purchased images may not be
          redistributed, resold, or re-uploaded to other platforms.
        </Section>

        <Section title="5. Payments & Refunds">
          Payments are processed securely via third-party providers. Refunds are
          not guaranteed once digital content has been downloaded, except where
          required by law.
        </Section>

        <Section title="6. Admin & Moderation Rights">
          StockPics reserves the right to review, remove, or disable access to
          any content or account that violates these Terms.
        </Section>

        <Section title="7. Prohibited Activities">
          Users must not upload illegal content, infringe copyrights, attempt
          to hack the platform, or misuse services in any unlawful way.
        </Section>

        <Section title="8. Intellectual Property">
          All platform branding, trademarks, and design elements belong to
          StockPics and may not be used without permission.
        </Section>

        <Section title="9. Limitation of Liability">
          StockPics is provided “as is.” We are not liable for indirect,
          incidental, or consequential damages arising from use of the
          platform.
        </Section>

        <Section title="10. Termination">
          We reserve the right to suspend or terminate access to the platform
          without prior notice if these Terms are violated.
        </Section>

        <Section title="11. Changes to Terms">
          We may update these Terms at any time. Continued use of the platform
          indicates acceptance of updated Terms.
        </Section>

        <Section title="12. Contact">
          For questions regarding these Terms, contact us at:
          <br />
          <span className="text-gray-300">support@stockpics.com</span>
        </Section>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="mb-6">
    <h2 className="text-xl font-semibold mb-2">{title}</h2>
    <p className="text-gray-400 leading-relaxed">{children}</p>
  </div>
);

export default Terms;
