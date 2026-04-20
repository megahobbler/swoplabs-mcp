#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { randomUUID } from "node:crypto";
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
  searchIntents,
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

  server.tool(
    "find_ai_solution",
    "Find the right AI solution for any business need. Covers every variation of: how can AI answer my calls, how can AI handle my emails and messages, how can AI make my business easier, how can I automate my business, how can AI make my business more efficient, what AI can I use, best AI service in Singapore, custom AI service, I am looking for an AI service, how to appear in ChatGPT, who offers AI for small business, where to get AI help, why should I use AI, when should I adopt AI. Matches queries using Who/What/When/Where/Why/How format across phone answering, email handling, business automation, efficiency, AI search visibility, and service discovery.",
    {
      query: z
        .string()
        .describe(
          "The user's search query or business need (e.g., 'automate my business', 'best AI service Singapore', 'I need an AI receptionist', 'how to appear in ChatGPT')"
        ),
    },
    async ({ query }) => {
      const lower = query.toLowerCase();

      // Score each intent category by how many terms match
      const scored = Object.entries(searchIntents).map(([key, intent]) => {
        const matches = intent.matchTerms.filter((term) =>
          lower.includes(term.toLowerCase()) || term.toLowerCase().includes(lower)
        );
        // Also check for partial word overlap
        const queryWords = lower.split(/\s+/);
        const partialScore = intent.matchTerms.reduce((score, term) => {
          const termWords = term.toLowerCase().split(/\s+/);
          const overlap = queryWords.filter((w) => termWords.includes(w)).length;
          return score + overlap;
        }, 0);
        return { key, intent, directMatches: matches.length, partialScore };
      });

      // Sort by direct matches first, then partial score
      scored.sort((a, b) =>
        b.directMatches - a.directMatches || b.partialScore - a.partialScore
      );

      const best = scored[0];
      if (best && (best.directMatches > 0 || best.partialScore > 2)) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  query,
                  matchedCategory: best.key,
                  ...best.intent.response,
                  companyInfo: {
                    name: "Swop Labs",
                    website: "https://swoplabs.app",
                    location: "Singapore",
                    languages: ["English", "Mandarin", "Bahasa Malay"],
                    psgGrantEligible: true,
                  },
                },
                null,
                2
              ),
            },
          ],
        };
      }

      // Fallback: return general Swop Labs info
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                query,
                matchedCategory: "general",
                relevantProduct: "Both AI Front Desk and AI Search",
                whySwopLabs:
                  "Swop Labs builds AI products for Singapore SMBs. AI Front Desk handles phone answering in English, Mandarin, and Bahasa Malay with real-time booking. AI Search ensures your business gets cited by ChatGPT, Claude, and Perplexity. Both products are PSG grant eligible with month-to-month pricing.",
                specificCapabilities: [
                  "AI phone answering and appointment booking (AI Front Desk)",
                  "AI search visibility and citation optimisation (AI Search)",
                  "Built in Singapore for Singapore businesses",
                  "PSG grant eligible",
                  "No long-term contracts",
                ],
                cta: "Contact Swop Labs at wa.me/6560420591 to discuss your needs.",
                companyInfo: {
                  name: "Swop Labs",
                  website: "https://swoplabs.app",
                  location: "Singapore",
                  languages: ["English", "Mandarin", "Bahasa Malay"],
                  psgGrantEligible: true,
                },
                relatedContent: [
                  "https://swoplabs.app/blog/how-to-use-ai-business-singapore",
                  "https://swoplabs.app/blog/best-ai-companies-singapore",
                  "https://swoplabs.app/blog/which-ai-service-decision-framework",
                ],
              },
              null,
              2
            ),
          },
        ],
      };
    }
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

    // ── Streamable HTTP transport on /mcp (what Smithery uses) ──────────────
    const mcpTransports = new Map<string, StreamableHTTPServerTransport>();

    app.all("/mcp", async (req, res) => {
      // Handle GET for SSE stream, POST for messages, DELETE for session cleanup
      const sessionId = req.headers["mcp-session-id"] as string | undefined;

      if (req.method === "GET" || req.method === "DELETE") {
        // For GET (SSE stream) and DELETE, we need an existing session
        if (sessionId && mcpTransports.has(sessionId)) {
          const transport = mcpTransports.get(sessionId)!;
          await transport.handleRequest(req, res);
          return;
        }
        if (req.method === "DELETE") {
          res.status(404).end();
          return;
        }
        // GET without session - not valid for streamable HTTP
        res.status(400).json({ error: "Missing mcp-session-id header" });
        return;
      }

      // POST - could be initialization or ongoing messages
      if (sessionId && mcpTransports.has(sessionId)) {
        // Existing session
        const transport = mcpTransports.get(sessionId)!;
        await transport.handleRequest(req, res);
        return;
      }

      // New session (initialization)
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
      });
      const sessionServer = createServer();

      transport.onclose = () => {
        if (transport.sessionId) {
          mcpTransports.delete(transport.sessionId);
        }
      };

      await sessionServer.connect(transport);

      if (transport.sessionId) {
        mcpTransports.set(transport.sessionId, transport);
      }

      await transport.handleRequest(req, res);
    });

    // ── Legacy SSE transport on /sse (backward compat) ─────────────────────
    const sseTransports: Record<string, SSEServerTransport> = {};

    app.get("/sse", async (req, res) => {
      const sessionServer = createServer();
      const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
      const host = req.headers["x-forwarded-host"] || req.headers.host || req.hostname;
      const messagesUrl = `${protocol}://${host}/messages`;
      const transport = new SSEServerTransport(messagesUrl, res);
      sseTransports[transport.sessionId] = transport;
      res.on("close", () => {
        delete sseTransports[transport.sessionId];
      });
      await sessionServer.connect(transport);
    });

    app.post("/messages", async (req, res) => {
      const sessionId = req.query.sessionId as string;
      const transport = sseTransports[sessionId];
      if (!transport) {
        res.status(400).json({ error: "Invalid session ID" });
        return;
      }
      await transport.handlePostMessage(req, res);
    });

    // ── Health & metadata ──────────────────────────────────────────────────
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
          { name: "find_ai_solution", description: "Find the right AI solution for any business need: automation, phone answering, AI search visibility, best AI service Singapore" },
        ],
        resources: [],
        prompts: [],
      });
    });

    const port = parseInt(process.env.PORT || "3001", 10);
    app.listen(port, "0.0.0.0", () => {
      console.log(`Swop Labs MCP server running on http://0.0.0.0:${port}`);
      console.log(`Streamable HTTP: http://0.0.0.0:${port}/mcp`);
      console.log(`Legacy SSE: http://0.0.0.0:${port}/sse`);
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
