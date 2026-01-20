# Exemples de données pour tests - Passeport Numérique

## 📱 Exemple 1 : Smartphone Écologique (Score A)

**POST** `http://localhost:8080/api/digital-passports`

```json
{
  "productId": 1,
  "carbonFootprint": {
    "totalCO2": 8.5,
    "manufacturing": 4.2,
    "transportation": 1.5,
    "usage": 2.0,
    "endOfLife": 0.8
  },
  "traceability": {
    "originCountry": "France",
    "manufacturer": "FairPhone Europe",
    "factory": "Usine écologique - Toulouse",
    "supplyChainJourney": [
      "🌍 Extraction matières - Congo (Conflict-free, Fair Trade)",
      "🏭 Fabrication composants - Pays-Bas (Énergie 100% renouvelable)",
      "⚙️ Assemblage final - France (Toulouse)",
      "📦 Distribution - Europe (Transport ferroviaire)"
    ],
    "transparencyScore": 98
  },
  "materials": [
    {
      "name": "Aluminium recyclé",
      "percentage": 45.0,
      "renewable": false,
      "recycled": true,
      "recyclable": true,
      "origin": "Europe"
    },
    {
      "name": "Plastique bio-sourcé (maïs)",
      "percentage": 25.0,
      "renewable": true,
      "recycled": false,
      "recyclable": true,
      "origin": "France"
    },
    {
      "name": "Composants électroniques certifiés",
      "percentage": 20.0,
      "renewable": false,
      "recycled": false,
      "recyclable": true,
      "origin": "Pays-Bas"
    },
    {
      "name": "Verre Gorilla recyclé",
      "percentage": 10.0,
      "renewable": false,
      "recycled": true,
      "recyclable": true,
      "origin": "Allemagne"
    }
  ],
  "durability": {
    "expectedLifespanYears": 8,
    "repairabilityScore": 9.5,
    "sparePartsAvailable": true,
    "warrantyYears": 5,
    "softwareUpdates": true
  },
  "certifications": [
    {
      "name": "Fair Trade Certified",
      "issuer": "Fair Trade International",
      "validUntil": "2027-12-31",
      "logoUrl": "https://fairtrade.org/logo.png",
      "verificationUrl": "https://fairtrade.org/verify/FT2024-001",
      "type": "ETHICAL"
    },
    {
      "name": "Blue Angel",
      "issuer": "German Federal Environment Agency",
      "validUntil": "2026-06-30",
      "logoUrl": "https://blauer-engel.de/logo.png",
      "verificationUrl": "https://blauer-engel.de/verify/BA-2024-789",
      "type": "ENVIRONMENTAL"
    },
    {
      "name": "TCO Certified",
      "issuer": "TCO Development",
      "validUntil": "2026-03-15",
      "logoUrl": "https://tcocertified.com/logo.png",
      "verificationUrl": "https://tcocertified.com/verify/TCO2024-456",
      "type": "QUALITY"
    }
  ],
  "recyclingInfo": {
    "recyclablePercentage": 98.0,
    "instructions": "Ce smartphone est conçu pour être entièrement recyclé. Retirez la carte SIM et carte mémoire. Déposez l'appareil dans un point de collecte agréé. Nous récupérons 98% des matériaux pour créer de nouveaux produits.",
    "takeBackProgram": true,
    "collectionPoints": [
      {
        "name": "Ecosystem - Paris Centre",
        "address": "15 Rue du Faubourg Montmartre, 75010 Paris",
        "distance": "2.3 km",
        "acceptedMaterials": ["Électronique", "Batteries Lithium", "Plastique", "Métaux", "Verre"]
      },
      {
        "name": "FairPhone Store Paris",
        "address": "42 Avenue des Champs-Élysées, 75008 Paris",
        "distance": "3.5 km",
        "acceptedMaterials": ["Smartphones", "Batteries", "Accessoires"]
      },
      {
        "name": "Darty - Gare du Nord",
        "address": "23 Boulevard de Denain, 75010 Paris",
        "distance": "3.1 km",
        "acceptedMaterials": ["Tous appareils électroniques"]
      }
    ]
  }
}
```

---

## 👕 Exemple 2 : T-Shirt Bio (Score B)

**POST** `http://localhost:8080/api/digital-passports`

```json
{
  "productId": 2,
  "carbonFootprint": {
    "totalCO2": 15.2,
    "manufacturing": 8.5,
    "transportation": 3.2,
    "usage": 2.5,
    "endOfLife": 1.0
  },
  "traceability": {
    "originCountry": "Portugal",
    "manufacturer": "EcoThreads Textile",
    "factory": "Usine Porto - Certifiée Fair Wear",
    "supplyChainJourney": [
      "🌱 Culture coton bio - Inde (Agriculture biologique certifiée)",
      "🧵 Filature - Portugal (Énergie solaire)",
      "🎨 Teinture naturelle - Portugal (Plantes locales)",
      "✂️ Confection - Porto, Portugal (Conditions de travail équitables)"
    ],
    "transparencyScore": 92
  },
  "materials": [
    {
      "name": "Coton biologique certifié GOTS",
      "percentage": 95.0,
      "renewable": true,
      "recycled": false,
      "recyclable": true,
      "origin": "Inde"
    },
    {
      "name": "Élasthanne (pour stretch)",
      "percentage": 5.0,
      "renewable": false,
      "recycled": false,
      "recyclable": false,
      "origin": "Europe"
    }
  ],
  "durability": {
    "expectedLifespanYears": 5,
    "repairabilityScore": 7.0,
    "sparePartsAvailable": false,
    "warrantyYears": 2,
    "softwareUpdates": null
  },
  "certifications": [
    {
      "name": "GOTS (Global Organic Textile Standard)",
      "issuer": "Control Union Certifications",
      "validUntil": "2026-03-15",
      "logoUrl": "https://global-standard.org/logo.png",
      "verificationUrl": "https://global-standard.org/verify/GOTS2024-001",
      "type": "ENVIRONMENTAL"
    },
    {
      "name": "Oeko-Tex Standard 100",
      "issuer": "Oeko-Tex Association",
      "validUntil": "2025-09-30",
      "logoUrl": "https://oeko-tex.com/logo.png",
      "verificationUrl": "https://oeko-tex.com/verify/OT2024-789",
      "type": "SAFETY"
    },
    {
      "name": "Fair Wear Foundation",
      "issuer": "Fair Wear Foundation",
      "validUntil": "2026-12-31",
      "logoUrl": "https://fairwear.org/logo.png",
      "verificationUrl": "https://fairwear.org/verify/FW2024-456",
      "type": "ETHICAL"
    }
  ],
  "recyclingInfo": {
    "recyclablePercentage": 95.0,
    "instructions": "Ce vêtement est composé à 95% de coton biologique recyclable. Lavez-le une dernière fois, puis déposez-le propre et sec dans un conteneur textile Le Relais ou similaire. Les fibres seront récupérées pour créer de nouveaux tissus.",
    "takeBackProgram": true,
    "collectionPoints": [
      {
        "name": "Le Relais - Conteneur Textile",
        "address": "Parking Carrefour, Avenue Jean Jaurès, 75019 Paris",
        "distance": "1.5 km",
        "acceptedMaterials": ["Vêtements", "Chaussures", "Linge de maison", "Maroquinerie"]
      },
      {
        "name": "H&M Recycling",
        "address": "Centre commercial Les Halles, 75001 Paris",
        "distance": "4.2 km",
        "acceptedMaterials": ["Tous textiles (même usés)"]
      }
    ]
  }
}
```

---

## 💻 Exemple 3 : Ordinateur Portable (Score C)

**POST** `http://localhost:8080/api/digital-passports`

```json
{
  "productId": 3,
  "carbonFootprint": {
    "totalCO2": 45.8,
    "manufacturing": 32.0,
    "transportation": 6.5,
    "usage": 5.5,
    "endOfLife": 1.8
  },
  "traceability": {
    "originCountry": "Chine",
    "manufacturer": "TechCorp Manufacturing",
    "factory": "Usine Shenzhen - ISO 14001",
    "supplyChainJourney": [
      "⛏️ Extraction terres rares - Chine",
      "🏭 Fabrication composants - Taïwan, Chine, Corée",
      "⚙️ Assemblage - Shenzhen, Chine",
      "🚢 Transport maritime - Asie → Europe",
      "📦 Distribution - France"
    ],
    "transparencyScore": 72
  },
  "materials": [
    {
      "name": "Aluminium (coque)",
      "percentage": 35.0,
      "renewable": false,
      "recycled": false,
      "recyclable": true,
      "origin": "Chine"
    },
    {
      "name": "Composants électroniques (CPU, GPU, RAM)",
      "percentage": 30.0,
      "renewable": false,
      "recycled": false,
      "recyclable": true,
      "origin": "Taïwan"
    },
    {
      "name": "Écran LCD",
      "percentage": 15.0,
      "renewable": false,
      "recycled": false,
      "recyclable": true,
      "origin": "Corée du Sud"
    },
    {
      "name": "Batterie Lithium-Ion",
      "percentage": 10.0,
      "renewable": false,
      "recycled": false,
      "recyclable": true,
      "origin": "Chine"
    },
    {
      "name": "Plastique (clavier, intérieur)",
      "percentage": 10.0,
      "renewable": false,
      "recycled": false,
      "recyclable": true,
      "origin": "Chine"
    }
  ],
  "durability": {
    "expectedLifespanYears": 6,
    "repairabilityScore": 5.5,
    "sparePartsAvailable": true,
    "warrantyYears": 2,
    "softwareUpdates": true
  },
  "certifications": [
    {
      "name": "Energy Star",
      "issuer": "US Environmental Protection Agency",
      "validUntil": "2025-12-31",
      "logoUrl": "https://energystar.gov/logo.png",
      "verificationUrl": "https://energystar.gov/verify/ES2024-123",
      "type": "ENVIRONMENTAL"
    },
    {
      "name": "ISO 14001",
      "issuer": "International Organization for Standardization",
      "validUntil": "2026-06-30",
      "logoUrl": "https://iso.org/logo.png",
      "verificationUrl": "https://iso.org/verify/ISO14001-2024-456",
      "type": "QUALITY"
    }
  ],
  "recyclingInfo": {
    "recyclablePercentage": 85.0,
    "instructions": "Cet ordinateur contient des matériaux précieux et potentiellement dangereux. Ne le jetez JAMAIS avec les ordures ménagères. Retirez vos données personnelles, puis déposez-le dans un point de collecte DEEE (Déchets d'Équipements Électriques et Électroniques).",
    "takeBackProgram": false,
    "collectionPoints": [
      {
        "name": "Ecosystem - Point de collecte DEEE",
        "address": "Déchetterie municipale, 12 Rue de la Mairie, 75020 Paris",
        "distance": "5.2 km",
        "acceptedMaterials": ["Ordinateurs", "Écrans", "Périphériques", "Batteries"]
      },
      {
        "name": "Magasin Fnac - Recyclage",
        "address": "Forum des Halles, 75001 Paris",
        "distance": "6.8 km",
        "acceptedMaterials": ["Électronique", "Informatique"]
      }
    ]
  }
}
```

---

## 🍎 Exemple 4 : Aliment Bio Local (Score A+)

**POST** `http://localhost:8080/api/digital-passports`

```json
{
  "productId": 4,
  "carbonFootprint": {
    "totalCO2": 2.1,
    "manufacturing": 1.0,
    "transportation": 0.3,
    "usage": 0.5,
    "endOfLife": 0.3
  },
  "traceability": {
    "originCountry": "France",
    "manufacturer": "Ferme Bio du Val de Loire",
    "factory": "Culture en plein champ - Circuit court",
    "supplyChainJourney": [
      "🌱 Semis - Ferme du Val de Loire (Agriculture bio)",
      "☀️ Culture - Loire-et-Cher (0 pesticides, compost naturel)",
      "🚜 Récolte - Manuelle, à maturité optimale",
      "🚚 Livraison - Directe aux marchés locaux (<50km)"
    ],
    "transparencyScore": 100
  },
  "materials": [
    {
      "name": "Produit agricole biologique",
      "percentage": 100.0,
      "renewable": true,
      "recycled": false,
      "recyclable": true,
      "origin": "France (Loire-et-Cher)"
    }
  ],
  "durability": {
    "expectedLifespanYears": null,
    "repairabilityScore": 0.0,
    "sparePartsAvailable": false,
    "warrantyYears": null,
    "softwareUpdates": null
  },
  "certifications": [
    {
      "name": "AB (Agriculture Biologique)",
      "issuer": "Agence Bio France",
      "validUntil": "2026-12-31",
      "logoUrl": "https://agencebio.org/logo.png",
      "verificationUrl": "https://agencebio.org/verify/AB2024-789",
      "type": "ENVIRONMENTAL"
    },
    {
      "name": "Label Rouge",
      "issuer": "Institut National de l'Origine et de la Qualité",
      "validUntil": "2025-12-31",
      "logoUrl": "https://labelrouge.fr/logo.png",
      "verificationUrl": "https://labelrouge.fr/verify/LR2024-123",
      "type": "QUALITY"
    }
  ],
  "recyclingInfo": {
    "recyclablePercentage": 100.0,
    "instructions": "Produit 100% biodégradable et compostable. Les déchets organiques peuvent être compostés à domicile ou dans un composteur collectif. L'emballage (si présent) est en carton recyclable.",
    "takeBackProgram": false,
    "collectionPoints": []
  }
}
```

---

## 🧪 Exemple 5 : Produit avec défauts (Score E - pour tester)

**POST** `http://localhost:8080/api/digital-passports`

```json
{
  "productId": 5,
  "carbonFootprint": {
    "totalCO2": 150.0,
    "manufacturing": 100.0,
    "transportation": 30.0,
    "usage": 15.0,
    "endOfLife": 5.0
  },
  "traceability": {
    "originCountry": "Inconnu",
    "manufacturer": "Fabricant non identifié",
    "factory": null,
    "supplyChainJourney": [],
    "transparencyScore": 15
  },
  "materials": [
    {
      "name": "Plastique vierge",
      "percentage": 70.0,
      "renewable": false,
      "recycled": false,
      "recyclable": false,
      "origin": "Asie"
    },
    {
      "name": "Métaux non recyclés",
      "percentage": 30.0,
      "renewable": false,
      "recycled": false,
      "recyclable": false,
      "origin": "Inconnu"
    }
  ],
  "durability": {
    "expectedLifespanYears": 1,
    "repairabilityScore": 0.5,
    "sparePartsAvailable": false,
    "warrantyYears": null,
    "softwareUpdates": false
  },
  "certifications": [],
  "recyclingInfo": {
    "recyclablePercentage": 10.0,
    "instructions": "Ce produit est difficilement recyclable. Contactez votre déchetterie locale pour connaître les options de traitement.",
    "takeBackProgram": false,
    "collectionPoints": []
  }
}
```

---

## 🔧 Comment utiliser ces exemples

### Avec Postman :

1. Ouvrez Postman
2. Créez une nouvelle requête POST
3. URL : `http://localhost:8080/api/digital-passports`
4. Headers :
   - `Content-Type: application/json`
   - `Authorization: Bearer {votre-token}`
5. Body → Raw → JSON
6. Copiez/collez un des exemples ci-dessus
7. Modifiez `productId` si besoin (assurez-vous que le produit existe)
8. Send !

### Avec cURL :

```bash
curl -X POST http://localhost:8080/api/digital-passports \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "productId": 1,
    ...
  }'
```

---

## ✅ Vérification

Après avoir créé un passeport, vérifiez avec :

```bash
curl http://localhost:8080/api/digital-passports/product/{productId}
```

Ou naviguez vers : `http://localhost:4200/test-passport` (après avoir ajouté la route)

---

**Astuce** : Créez les 5 exemples pour tester tous les cas (A, B, C, E, et produit alimentaire)
