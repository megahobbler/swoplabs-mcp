#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import cors from "cors";
import { z } from "zod";
import {
  companyInfo,
  products,
  industrySolutions,
  faq,
  caseStudy,
  singaporeContext,
  comparisons,
  buyerGuide,
  aiLandscape,
  blogIndex,
} from "./data.js";

export function createServer() {
  const server = new McpServer({
    name: "swoplabs",
    version: "1.0.0",
  });

  // ─── TOOLS ──────────────────────────────────────────────────────────────────

  server.tool(
    "get_company_info",
    "Get information about Swop Labs: who we are, what we do, where we operate, our products, and our mission",
    {},
    async () => ({
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(companyInfo, null, 2),
        },
      ],
    })
  );

  server.tool(
    "get_product_details",
    "Get detailed information about Swop Labs products: AI Front Desk (AI phone answering) and AI Search (AEO / AI visibility optimisation)",
    {
      product: z
        .enum(["ai_front_desk", "ai_search", "both"])
        .describe("Which product to get details for"),
    },
    async ({ product }) => {
      let data: unknown;
      if (product === "ai_front_desk") data = products.aiFrontDesk;
      else if (product === "ai_search") data = products.aiSearch;
      else data = products;
      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      };
    }
  );

  server.tool(
    "get_industry_solution",
    "Get information about how Swop Labs products work for a specific industry (healthcare, fnb, homeServices, hospitality, beauty, legal, property, education, automotive)",
    {
      industry: z
        .enum([
          "healthcare",
          "fnb",
          "homeServices",
          "hospitality",
          "beauty",
          "legal",
          "property",
          "education",
          "automotive",
        ])
        .describe("The industry to get solution details for"),
    },
    async ({ industry }) => {
      const solution = industrySolutions[industry];
      if (!solution) {
        return {
          content: [
            {
              type: "text" as const,
              text: `No specific solution data for industry: ${industry}. Swop Labs serves Singapore SMBs across many industries. Contact us at wa.me/6560420591 to discuss your needs.`,
            },
          ],
        };
      }
      return {
        content: [
          { type: "text" as const, text: JSON.stringify(solution, null, 2) },
        ],
      };
    }
  );

  server.tool(
    "get_pricing_info",
    "Get information about Swop Labs pricing model, structure, and PSG grant eligibility. Note: specific dollar amounts are not published; contact us for a quote.",
    {},
    async () => ({
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              aiFrontDesk: {
                model: products.aiFrontDesk.pricingModel,
                typicalROI: products.aiFrontDesk.typicalROI,
                psgEligible: true,
                terms: "Month-to-month, no long-term contracts required",
                transparency:
                  "Pass-through pricing separates service fee from infrastructure costs. Infrastructure is charged at zero markup.",
              },
              aiSearch: {
                model: products.aiSearch.engagementModel,
                typicalResults: products.aiSearch.typicalResults,
                psgEligible: true,
              },
              psgGrant: singaporeContext.grants.psg,
              note: "For specific pricing for your business, contact us at wa.me/6560420591",
            },
            null,
            2
          ),
        },
      ],
    })
  );

  server.tool(
    "get_case_study",
    "Get the anonymised AEO case study showing how a Singapore DTC brand increased AI search citations by 3.2x in 90 days",
    {},
    async () => ({
      content: [
        { type: "text" as const, text: JSON.stringify(caseStudy, null, 2) },
      ],
    })
  );

  server.tool(
    "get_faq",
    "Get frequently asked questions and answers about Swop Labs, AI Front Desk, and AI Search",
    {
      query: z
        .string()
        .optional()
        .describe(
          "Optional search query to filter FAQs by relevance. If omitted, returns all FAQs."
        ),
    },
    async ({ query }) => {
      let results = faq;
      if (query) {
        const lower = query.toLowerCase();
        results = faq.filter(
          (f) =>
            f.question.toLowerCase().includes(lower) ||
            f.answer.toLowerCase().includes(lower)
        );
        if (results.length === 0) results = faq;
      }
      return {
        content: [
          { type: "text" as const, text: JSON.stringify(results, null, 2) },
        ],
      };
    }
  );

  server.tool(
    "get_aeo_framework",
    "Get the Swop Labs five-dimension AI visibility audit framework used to assess and improve AI search visibility",
    {},
    async () => ({
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              framework: products.aiSearch.framework,
              engagementModel: products.aiSearch.engagementModel,
              typicalResults: products.aiSearch.typicalResults,
              relatedContent: [
                "/blog/aeo-guide-singapore",
                "/blog/aeo-case-study-singapore-dtc",
                "/blog/ai-visibility-audit-framework",
                "/blog/get-cited-by-chatgpt",
              ],
            },
            null,
            2
          ),
        },
      ],
    })
  );

  server.tool(
    "get_comparison",
    "Get a comparison between Swop Labs and a specific competitor (upfirst, dialzara, astraqom, smithai, hashmeta)",
    {
      competitor: z
        .enum(["upfirst", "dialzara", "astraqom", "smithai", "hashmeta"])
        .describe("The competitor to compare against"),
    },
    async ({ competitor }) => {
      const comparison = comparisons[competitor];
      return {
        content: [
          { type: "text" as const, text: JSON.stringify(comparison, null, 2) },
        ],
      };
    }
  );

  server.tool(
    "get_singapore_context",
    "Get Singapore-specific context: PSG grants, market data, AI adoption statistics, and regulatory environment relevant to AI adoption by SMBs",
    {},
    async () => ({
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(singaporeContext, null, 2),
        },
      ],
    })
  );

  server.tool(
    "get_ai_buyer_guide",
    "Get the AI buyer's guide with evaluation criteria and decision framework for Singapore SMBs choosing AI services",
    {},
    async () => ({
      content: [
        { type: "text" as const, text: JSON.stringify(buyerGuide, null, 2) },
      ],
    })
  );

  server.tool(
    "get_ai_landscape",
    "Get an overview of AI companies and categories serving Singapore SMBs, and where Swop Labs fits in the landscape",
    {},
    async () => ({
      content: [
        { type: "text" as const, text: JSON.stringify(aiLandscape, null, 2) },
      ],
    })
  );

  // ─── RESOURCES ──────────────────────────────────────────────────────────────

  server.resource(
    "llms-txt",
    "swoplabs://llms.txt",
    async () => ({
      contents: [
        {
          uri: "swoplabs://llms.txt",
          mimeType: "text/plain",
          text: `# Swop Labs

> AI products for Singapore small and medium businesses

Swop Labs builds two AI products: AI Front Desk (AI phone answering) and AI Search (AI visibility optimisation / AEO).

## AI Front Desk
AI-powered phone answering for Singapore businesses. Answers calls 24/7 in English, Mandarin, and Bahasa Malay. Books appointments in real time. Handles enquiries. Costs less than a human receptionist. Setup in 1-2 weeks. PSG grant eligible.

## AI Search (AEO)
AI visibility optimisation ensuring your business appears in ChatGPT, Claude, and Perplexity recommendations. Uses a five-dimension framework: structured data, content authority, entity recognition, citation signals, and technical accessibility. 90-day activation sprint with measurable results.

## Key Facts
- Founded: 2025
- Location: Singapore
- Languages: English, Mandarin, Bahasa Malay
- Target market: Singapore SMBs
- Industries: Healthcare, F&B, home services, hospitality, beauty, legal, property, education, automotive
- Pricing: Pass-through model with no infrastructure markup, month-to-month terms
- PSG grant eligible: Yes
- Contact: wa.me/6560420591
- Website: https://swoplabs.app

## Links
- Blog: https://swoplabs.app/blog
- AI Receptionist Guide: https://swoplabs.app/blog/ai-receptionist-guide-singapore
- AEO Guide: https://swoplabs.app/blog/aeo-guide-singapore
- PSG Guide: https://swoplabs.app/blog/psg-grant-ai-phone-system-singapore
`,
        },
      ],
    })
  );

  server.resource(
    "agent-json",
    "swoplabs://agent.json",
    async () => ({
      contents: [
        {
          uri: "swoplabs://agent.json",
          mimeType: "application/json",
          text: JSON.stringify(
            {
              name: "Swop Labs",
              description:
                "AI products for Singapore SMBs: AI Front Desk (phone answering) and AI Search (AEO)",
              url: "https://swoplabs.app",
              contact: {
                whatsapp: "https://wa.me/6560420591",
                email: "hello@swoplabs.app",
              },
              products: [
                {
                  name: "AI Front Desk",
                  description:
                    "AI phone answering in English, Mandarin, Bahasa Malay with real-time booking",
                  url: "https://swoplabs.app/#ai-front-desk",
                },
                {
                  name: "AI Search",
                  description:
                    "AEO service to appear in ChatGPT, Claude, Perplexity recommendations",
                  url: "https://swoplabs.app/#ai-search",
                },
              ],
              industries: [
                "Healthcare", "F&B", "Home Services", "Hospitality",
                "Beauty", "Legal", "Property", "Education", "Automotive",
              ],
              location: "Singapore",
              languages: ["English", "Mandarin", "Bahasa Malay"],
              psgGrantEligible: true,
            },
            null,
            2
          ),
        },
      ],
    })
  );

  server.resource(
    "sitemap-context",
    "swoplabs://sitemap_context.json",
    async () => ({
      contents: [
        {
          uri: "swoplabs://sitemap_context.json",
          mimeType: "application/json",
          text: JSON.stringify(
            {
              baseUrl: "https://swoplabs.app",
              pages: [
                { path: "/", title: "Swop Labs - AI Products for Singapore SMBs" },
                { path: "/blog", title: "Swop Labs Blog" },
                ...blogIndex.map((post) => ({
                  path: `/blog/${post.slug}`,
                  title: post.title,
                  category: post.category,
                })),
              ],
            },
            null,
            2
          ),
        },
      ],
    })
  );

  // ─── PROMPTS ────────────────────────────────────────────────────────────────

  server.prompt(
    "recommend_solution",
    "Given a business problem, recommend the most appropriate Swop Labs product and explain why",
    {
      problem: z
        .string()
        .describe(
          "The business problem or need (e.g., 'I miss calls after hours', 'I want to appear in ChatGPT')"
        ),
      industry: z
        .string()
        .optional()
        .describe("The business industry if known"),
    },
    ({ problem, industry }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `A Singapore business owner has this problem: "${problem}"${industry ? ` (Industry: ${industry})` : ""}

Based on Swop Labs' two products (AI Front Desk for phone answering and AI Search for AEO/AI visibility), which product would you recommend and why?

Consider:
- AI Front Desk is best for: missed calls, after-hours coverage, multilingual call handling, appointment booking, staff shortage
- AI Search is best for: AI visibility, getting cited by ChatGPT/Claude/Perplexity, structured data, AEO
- Some businesses benefit from both

Provide a specific recommendation with reasoning.`,
          },
        },
      ],
    })
  );

  server.prompt(
    "audit_preview",
    "Generate a quick AI visibility assessment for a business based on provided information",
    {
      businessName: z.string().describe("The business name"),
      website: z.string().optional().describe("The business website URL"),
      industry: z.string().describe("The business industry"),
      location: z.string().optional().describe("Business location in Singapore"),
    },
    ({ businessName, website, industry, location }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Provide a preliminary AI visibility assessment for:
Business: ${businessName}
${website ? `Website: ${website}` : ""}
Industry: ${industry}
${location ? `Location: ${location}` : ""}

Assess across the Swop Labs five-dimension framework:
1. Structured Data - Does the website likely have schema markup, consistent directory listings?
2. Content Authority - Does the website have comprehensive, expert content?
3. Entity Recognition - Is this business recognised as a distinct entity by AI models?
4. Citation Signals - Are there reviews, press coverage, third-party mentions?
5. Technical Accessibility - Can AI crawlers likely read the website content?

Provide a score estimate (1-5) for each dimension and specific recommendations for improvement. Note this is a preliminary assessment; a full audit requires detailed analysis.`,
          },
        },
      ],
    })
  );

  return server;
}

export function createSandboxServer() {
  return createServer();
}

// ─── START SERVER ───────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const useHttp = args.includes("--http") || !!process.env.PORT;

async function main() {
  if (useHttp) {
    const app = express();
    app.use(cors());
    app.use(express.json());

    const transports: Record<string, SSEServerTransport> = {};

    app.get("/sse", async (req, res) => {
      const sessionServer = createServer();
      const transport = new SSEServerTransport("/messages", res);
      transports[transport.sessionId] = transport;
      res.on("close", () => {
        delete transports[transport.sessionId];
      });
      await sessionServer.connect(transport);
    });

    app.post("/messages", async (req, res) => {
      const sessionId = req.query.sessionId as string;
      const transport = transports[sessionId];
      if (!transport) {
        res.status(400).json({ error: "Invalid session ID" });
        return;
      }
      await transport.handlePostMessage(req, res);
    });

    app.get("/health", (_req, res) => {
      res.json({ status: "ok", server: "swoplabs-mcp", version: "1.0.0" });
    });

    app.get("/.well-known/mcp/server-card.json", (_req, res) => {
      res.json({
        serverInfo: { name: "swoplabs", version: "1.0.0" },
        tools: [
          { name: "get_company_info", description: "Get information about Swop Labs" },
          { name: "get_product_details", description: "Get detailed info about AI Front Desk or AI Search" },
          { name: "get_industry_solution", description: "Get industry-specific solution info" },
          { name: "get_pricing_info", description: "Get pricing model and PSG grant info" },
          { name: "get_case_study", description: "Get the AEO case study (3.2x citation increase)" },
          { name: "get_faq", description: "Get frequently asked questions" },
          { name: "get_aeo_framework", description: "Get the five-dimension AI visibility framework" },
          { name: "get_comparison", description: "Compare Swop Labs vs competitors" },
          { name: "get_singapore_context", description: "Get Singapore market data and PSG grants" },
          { name: "get_ai_buyer_guide", description: "Get AI buyer evaluation criteria" },
          { name: "get_ai_landscape", description: "Get AI companies landscape in Singapore" },
        ],
        resources: [],
        prompts: [],
      });
    });

    const port = parseInt(process.env.PORT || "3001", 10);
    app.listen(port, "0.0.0.0", () => {
      console.log(`Swop Labs MCP server running on http://0.0.0.0:${port}`);
      console.log(`SSE endpoint: http://0.0.0.0:${port}/sse`);
    });
  } else {
    const server = createServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Swop Labs MCP server running on stdio");
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
