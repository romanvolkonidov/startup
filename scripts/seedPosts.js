const fetch = require('node-fetch');

// Your auth token - replace this with your actual token
const TOKEN = 'your-auth-token'; // Get this by logging in manually first

// Sample project data (10 examples with realistic funding needs)
const examplePosts = [
  {
    title: "AI-Driven Customer Service Platform",
    description: "Our platform uses advanced AI to handle customer inquiries 24/7, reducing support costs by 60% while improving customer satisfaction. Looking for initial funding to complete our prototype and launch a beta with 5 local businesses.",
    amount: 120000,
    returnPercent: 15,
    paybackTime: "18 months",
    phone: "0712345678",
    whatsapp: "0712345678"
  },
  {
    title: "Urban Hydroponic Farming Solution",
    description: "Revolutionary hydroponic farming system that uses 90% less water than traditional farming while producing higher yields in urban environments. Seeking funding to expand our pilot farm and reach more local markets in Nairobi.",
    amount: 85000,
    returnPercent: 20,
    paybackTime: "24 months",
    phone: "0723456789",
    instagram: "@urbanhydroponics"
  },
  {
    title: "Mobile Charging Kiosk",
    description: "Solar-powered mobile charging kiosk for rural communities without reliable electricity. Each kiosk can charge up to 30 phones simultaneously and includes LED lighting for evening operations. Funding will help build 5 kiosks in Kisumu County.",
    amount: 45000,
    returnPercent: 25,
    paybackTime: "12 months",
    phone: "0734567890",
    whatsapp: "0734567890",
    facebook: "SolarChargingKE"
  },
  {
    title: "Handcrafted Ethical Fashion Brand",
    description: "Creating sustainable, ethical fashion using traditional Kenyan techniques and materials. Each piece supports local artisans with fair wages and environmentally friendly practices. Funding needed for materials and expanding our workshop.",
    amount: 30000,
    returnPercent: 18,
    paybackTime: "15 months",
    phone: "0745678901",
    instagram: "@ethicalfashionKE",
    website: "ethicalfashionke.com"
  },
  {
    title: "Tech Education for Youth",
    description: "After-school coding and technology program for underserved youth aged 12-18. Our curriculum covers web development, mobile app creation, and basic hardware skills. Looking to fund equipment and teacher salaries for 3 new locations.",
    amount: 65000,
    returnPercent: 12,
    paybackTime: "30 months",
    phone: "0756789012",
    email: "techedu@example.com",
    instagram: "@techeduKenya"
  },
  {
    title: "Motorcycle Delivery App",
    description: "On-demand motorcycle delivery service connecting local businesses with riders. Our app optimizes routes and allows real-time tracking. Funding will go toward app refinement, marketing, and onboarding 50 more riders in Mombasa.",
    amount: 95000,
    returnPercent: 22,
    paybackTime: "16 months",
    phone: "0767890123",
    whatsapp: "0767890123",
    website: "speedyrider.co.ke"
  },
  {
    title: "Reusable Food Packaging Service",
    description: "Sustainable food container service for restaurants and food delivery. We provide, collect, clean, and redistribute durable containers, eliminating single-use plastics. Need funding for inventory expansion and washing facility improvements.",
    amount: 55000,
    returnPercent: 17,
    paybackTime: "20 months",
    phone: "0778901234",
    instagram: "@nowastecontainers",
    email: "info@nowastecontainers.co.ke"
  },
  {
    title: "Local Crafts Marketplace",
    description: "Online marketplace connecting Kenyan artisans directly with global buyers. Our platform handles payments, shipping, and marketing, giving creators 85% of sales. Funding needed for platform development and artisan onboarding program.",
    amount: 150000,
    returnPercent: 16,
    paybackTime: "36 months",
    phone: "0789012345",
    website: "kenyacrafts.com",
    instagram: "@kenyacraftsmarket"
  },
  {
    title: "Community Water Filtration System",
    description: "Low-cost water filtration system designed for rural communities. Each unit can provide clean drinking water for up to 200 people daily. Seeking funds to install systems in 5 villages in Western Kenya and train local maintenance teams.",
    amount: 110000,
    returnPercent: 14,
    paybackTime: "40 months",
    phone: "0790123456",
    whatsapp: "0790123456",
    facebook: "CleanWaterKenya"
  },
  {
    title: "Mobile Barber Shop",
    description: "Fully equipped mobile barber shop in a converted van, bringing professional haircuts to busy professionals and underserved communities. Need funding for van purchase and equipment installation to launch our first mobile unit.",
    amount: 3000,
    returnPercent: 30,
    paybackTime: "6 months",
    phone: "0701234567",
    instagram: "@mobilecutske",
    whatsapp: "0701234567"
  }
];

// Function to create posts sequentially
async function createPosts() {
  console.log('Starting to create posts...');
  
  for (const post of examplePosts) {
    try {
      const response = await fetch('http://localhost:3001/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`
        },
        body: JSON.stringify(post)
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`Successfully created post: ${post.title}`);
      } else {
        console.error(`Failed to create post: ${post.title}`, data.message);
      }
      
      // Add a small delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`Error creating post: ${post.title}`, error);
    }
  }
  
  console.log('Finished creating posts!');
}

// Run the function
createPosts();