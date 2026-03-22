/**
 * Treatment Catalog Seed Script
 *
 * Run once to populate the treatments collection:
 *   node api/v1/treatments/seed.js
 *
 * Safe to re-run — uses upsert (no duplicates created).
 */

const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const { TreatmentModel } = require("../../../models/treatmentSchema");

const TREATMENTS = [
    // ── Normal ──────────────────────────────────────────────────────────────────
    {
        treatmentCode: "NORMAL-GENERAL",
        name: "General Consultation",
        category: "normal",
        indications: [
            "fever",
            "cold",
            "cough",
            "headache",
            "general illness",
            "follow-up",
        ],
        contraindications: [],
        defaultSessionCount: 1,
        estimatedFeeMin: 200,
        estimatedFeeMax: 500,
        active: true,
    },
    {
        treatmentCode: "NORMAL-URGENT",
        name: "Urgent Care Consultation",
        category: "normal",
        indications: [
            "emergency",
            "severe pain",
            "acute illness",
            "injury",
            "high fever",
        ],
        contraindications: [],
        defaultSessionCount: 1,
        estimatedFeeMin: 400,
        estimatedFeeMax: 800,
        active: true,
    },

    // ── Ayurveda ─────────────────────────────────────────────────────────────────
    {
        treatmentCode: "AYU-GENERAL",
        name: "Ayurvedic General Consultation",
        category: "ayurveda",
        indications: [
            "chronic illness",
            "lifestyle disorders",
            "stress",
            "digestive issues",
            "immunity boost",
        ],
        contraindications: ["acute emergencies"],
        defaultSessionCount: 3,
        estimatedFeeMin: 500,
        estimatedFeeMax: 1000,
        active: true,
    },
    {
        treatmentCode: "AYU-ABHYANGA",
        name: "Abhyanga (Full Body Oil Massage)",
        category: "ayurveda",
        indications: [
            "joint pain",
            "stress",
            "fatigue",
            "vata imbalance",
            "dry skin",
            "insomnia",
        ],
        contraindications: ["skin infections", "fever", "open wounds"],
        defaultSessionCount: 7,
        estimatedFeeMin: 800,
        estimatedFeeMax: 1500,
        active: true,
    },
    {
        treatmentCode: "AYU-SHIRODHARA",
        name: "Shirodhara (Continuous Oil Flow Therapy)",
        category: "ayurveda",
        indications: [
            "stress",
            "insomnia",
            "anxiety",
            "pitta imbalance",
            "migraine",
            "hypertension",
        ],
        contraindications: [
            "scalp infections",
            "pregnancy",
            "fever",
            "neck injury",
        ],
        defaultSessionCount: 7,
        estimatedFeeMin: 1000,
        estimatedFeeMax: 2000,
        active: true,
    },
    {
        treatmentCode: "AYU-KIZHI",
        name: "Kizhi (Herbal Pouch Massage)",
        category: "ayurveda",
        indications: [
            "arthritis",
            "back pain",
            "muscle stiffness",
            "neurological disorders",
        ],
        contraindications: ["skin infections", "fever", "pregnancy"],
        defaultSessionCount: 7,
        estimatedFeeMin: 900,
        estimatedFeeMax: 1800,
        active: true,
    },

    // ── Panchakarma ───────────────────────────────────────────────────────────────
    {
        treatmentCode: "PKM-BASIC",
        name: "Panchakarma Basic Detox Program",
        category: "panchakarma",
        indications: [
            "chronic pain",
            "arthritis",
            "back pain",
            "stress",
            "digestive disorders",
            "obesity",
            "general detox",
        ],
        contraindications: [
            "pregnancy",
            "severe anaemia",
            "cardiac conditions",
            "acute fever",
        ],
        defaultSessionCount: 14,
        estimatedFeeMin: 5000,
        estimatedFeeMax: 15000,
        active: true,
    },
    {
        treatmentCode: "PKM-VIRECHANA",
        name: "Virechana (Therapeutic Purgation)",
        category: "panchakarma",
        indications: [
            "pitta disorders",
            "digestive issues",
            "skin diseases",
            "liver disorders",
            "hyperacidity",
        ],
        contraindications: [
            "diarrhoea",
            "dehydration",
            "pregnancy",
            "severe weakness",
        ],
        defaultSessionCount: 7,
        estimatedFeeMin: 3000,
        estimatedFeeMax: 8000,
        active: true,
    },
    {
        treatmentCode: "PKM-BASTI",
        name: "Basti (Medicated Enema Therapy)",
        category: "panchakarma",
        indications: [
            "vata disorders",
            "constipation",
            "neurological conditions",
            "back pain",
            "arthritis",
            "infertility",
        ],
        contraindications: ["diarrhoea", "bleeding disorders", "pregnancy"],
        defaultSessionCount: 8,
        estimatedFeeMin: 4000,
        estimatedFeeMax: 10000,
        active: true,
    },
    {
        treatmentCode: "PKM-NASYA",
        name: "Nasya (Nasal Administration Therapy)",
        category: "panchakarma",
        indications: [
            "sinusitis",
            "migraine",
            "kapha disorders",
            "cervical spondylitis",
            "hair fall",
        ],
        contraindications: [
            "pregnancy",
            "menstruation",
            "fever",
            "nasal bleeding",
        ],
        defaultSessionCount: 7,
        estimatedFeeMin: 2000,
        estimatedFeeMax: 5000,
        active: true,
    },
    {
        treatmentCode: "PKM-RAKTAMOKSHANA",
        name: "Raktamokshana (Blood Purification Therapy)",
        category: "panchakarma",
        indications: [
            "skin disorders",
            "psoriasis",
            "eczema",
            "gout",
            "pitta vitiation",
        ],
        contraindications: [
            "bleeding disorders",
            "anaemia",
            "pregnancy",
            "children under 12",
        ],
        defaultSessionCount: 3,
        estimatedFeeMin: 3000,
        estimatedFeeMax: 7000,
        active: true,
    },
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB_URL);
        console.log("Connected to MongoDB");

        let created = 0;
        let updated = 0;

        for (const treatment of TREATMENTS) {
            const result = await TreatmentModel.findOneAndUpdate(
                { treatmentCode: treatment.treatmentCode },
                { $set: treatment },
                { upsert: true, new: true, runValidators: true },
            );
            if (result.createdAt.getTime() === result.updatedAt.getTime()) {
                created++;
            } else {
                updated++;
            }
        }

        console.log(
            `Seed complete — ${created} created, ${updated} updated, ${TREATMENTS.length} total.`,
        );
    } catch (err) {
        console.error("Seed failed:", err.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
};

seed();
