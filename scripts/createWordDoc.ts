import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType
} from 'docx';
import fs from 'fs';
import path from 'path';

async function generate() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            text: 'SG AirAlert — Prompts & Architecture Log',
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 }
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'Compiled on: 16 October 2026  |  Author: ricekoh2017@gmail.com',
                italics: true,
                color: '555555'
              })
            ],
            spacing: { after: 300 }
          }),

          // Metadata Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: '0B192C' },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Project', bold: true, color: '38BDF8' })
                        ]
                      })
                    ]
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'SG AirAlert: Live Singapore PSI & Air Quality Monitor' })
                        ]
                      })
                    ]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: '0B192C' },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Repository', bold: true, color: '38BDF8' })
                        ]
                      })
                    ]
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'https://github.com/ricekoh2017-maker/SG-HAZE-FORECAST-OCT-2026' })
                        ]
                      })
                    ]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: '0B192C' },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Tech Stack', bold: true, color: '38BDF8' })
                        ]
                      })
                    ]
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'React 19, TypeScript, Tailwind CSS, Express, WebPush, NEA Open Data APIs' })
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          }),

          new Paragraph({ spacing: { after: 300 } }),

          // Section 1
          new Paragraph({
            text: '1. Initial Frontend Build & Interactive Map',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Prompt Used:', bold: true })
            ],
            spacing: { after: 60 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'build a singapore based application that tracks live PSI level and alerts users when air quality drops to unhealthy thresholds. it should include an interactive map and push notifications.\n\nBuild just the front end for now, i will add the serverless backed connection later',
                font: 'Courier New',
                size: 20
              })
            ],
            shading: { type: ShadingType.CLEAR, fill: 'F1F5F9' },
            spacing: { after: 180 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Features Implemented:', bold: true })
            ],
            spacing: { after: 60 }
          }),
          new Paragraph({
            text: '• Live PSI & PM2.5 tracking across all 5 official NEA sectors (North, South, East, West, Central).',
            bullet: { level: 0 }
          }),
          new Paragraph({
            text: '• Interactive SVG Vector Map of Singapore with regional auras, active station pins, and offshore islands.',
            bullet: { level: 0 }
          }),
          new Paragraph({
            text: '• Real browser Web Notifications API integration with custom user-configured PSI and PM2.5 thresholds.',
            bullet: { level: 0 }
          }),
          new Paragraph({
            text: '• In-app Web Audio API synthesizer generating dual-frequency alert chimes and critical emergency sirens.',
            bullet: { level: 0 }
          }),
          new Paragraph({
            text: '• Official NEA Health Advisory matrix tailored for healthy persons, vulnerable groups, and chronic lung/heart patients.',
            bullet: { level: 0 }
          }),
          new Paragraph({
            text: '• Outdoor Activity Planner rating East Coast Park, MacRitchie Reservoir, Marina Bay, Jurong Lake Gardens, and Sentosa.',
            bullet: { level: 0 }
          }),
          new Paragraph({
            text: '• 24-Hour Historical Hourly Trajectory chart with threshold guideline boundaries.',
            bullet: { level: 0 }
          }),

          // Section 2
          new Paragraph({
            text: '2. Serverless NEA Datamall Backend Connection',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 120 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Prompt Used:', bold: true })
            ],
            spacing: { after: 60 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'add a serverless connection that pulls live data from NEA Datamall using the following endpoints:\n\n- store this in /api folder (project root level) not the src folder\n- include /health.ts and /hazePSI.ts within that subfolder\n- there is no API key\n\nGET \nhttps://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast\n\n# accept: application/json',
                font: 'Courier New',
                size: 20
              })
            ],
            shading: { type: ShadingType.CLEAR, fill: 'F1F5F9' },
            spacing: { after: 180 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Features Implemented:', bold: true })
            ],
            spacing: { after: 60 }
          }),
          new Paragraph({
            text: '• Created root-level /api/health.ts: returns system uptime, health status, and upstream endpoint status.',
            bullet: { level: 0 }
          }),
          new Paragraph({
            text: '• Created root-level /api/hazePSI.ts: connects to https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast and https://api.data.gov.sg/v1/environment/psi without API keys.',
            bullet: { level: 0 }
          }),
          new Paragraph({
            text: '• Weather-driven Haze Washout projection: analyzes 47 town-level forecasts to predict whether rain will wash down airborne particulates.',
            bullet: { level: 0 }
          }),
          new Paragraph({
            text: '• Full-stack Express integration via server.ts mounting Vite development middleware and production static handling.',
            bullet: { level: 0 }
          }),
          new Paragraph({
            text: '• Created WeatherDispersalBanner component in the frontend to display valid time windows and local shower forecasts.',
            bullet: { level: 0 }
          }),

          // Section 3
          new Paragraph({
            text: '3. GitHub Remote Sync & Deployment',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 120 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Prompt Used:', bold: true })
            ],
            spacing: { after: 60 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'git push https://<PERSONAL_ACCESS_TOKEN>@github.com/ricekoh2017-maker/SG-HAZE-FORECAST-OCT-2026.git',
                font: 'Courier New',
                size: 20
              })
            ],
            shading: { type: ShadingType.CLEAR, fill: 'F1F5F9' },
            spacing: { after: 180 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Outcome:', bold: true })
            ],
            spacing: { after: 60 }
          }),
          new Paragraph({
            text: '• Configured Git repository with full commit history.',
            bullet: { level: 0 }
          }),
          new Paragraph({
            text: '• Successfully authenticated with GitHub Personal Access Token generated under user ricekoh2017-maker.',
            bullet: { level: 0 }
          }),
          new Paragraph({
            text: '• Pushed main branch to https://github.com/ricekoh2017-maker/SG-HAZE-FORECAST-OCT-2026.',
            bullet: { level: 0 }
          })
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  const rootPath = path.resolve(process.cwd(), 'SG_AirAlert_Prompts_16Oct2026.docx');
  const publicDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const publicPath = path.resolve(publicDir, 'SG_AirAlert_Prompts_16Oct2026.docx');

  fs.writeFileSync(rootPath, buffer);
  fs.writeFileSync(publicPath, buffer);

  console.log(`Successfully generated Word Document at: ${rootPath}`);
  console.log(`Also copied to public web root at: ${publicPath}`);
}

generate().catch(err => {
  console.error('Failed to generate docx:', err);
  process.exit(1);
});
