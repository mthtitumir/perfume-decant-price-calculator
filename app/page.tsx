import { DecantCalculator } from "@/components/decant-calculator";
import { seoKeywords, siteDescription, siteName, siteUrl } from "@/lib/site";

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${siteUrl}/#webapp`,
        name: siteName,
        url: siteUrl,
        image: `${siteUrl}/decant.png`,
        description: siteDescription,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Any",
        inLanguage: "en-BD",
        keywords: seoKeywords.join(", "),
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "BDT",
        },
        audience: {
          "@type": "Audience",
          audienceType: "Perfume sellers and decant sellers in Bangladesh",
        },
        featureList: [
          "Calculate perfume decant prices in BDT",
          "Add bottle cost, shipping cost, packaging cost, and profit percentage",
          "Create downloadable perfume price cards",
          "Compare competitor decant prices",
          "Customize decant sizes such as 3ml, 5ml, 10ml, and 15ml",
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${siteUrl}/#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "How do I calculate perfume decant price in Bangladesh?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Add the bottle purchase price, shipping or import cost, bottle size, packaging costs, and desired profit percentage. The calculator finds cost per ml and profitable selling prices for selected decant sizes in BDT.",
            },
          },
          {
            "@type": "Question",
            name: "Can I calculate 5ml and 10ml decant prices?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. You can calculate common decant sizes including 2ml, 3ml, 5ml, 10ml, 15ml, 20ml, and 30ml, or add custom sizes.",
            },
          },
          {
            "@type": "Question",
            name: "Does this tool include packaging cost?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Packaging can include decant bottle cost, sticker cost, bubble wrap cost, and miscellaneous cost for every decant.",
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <DecantCalculator />
    </>
  );
}
