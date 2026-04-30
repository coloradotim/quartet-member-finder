export const publicHelpSections = [
  {
    body: [
      "Quartet Member Finder helps barbershop singers and incomplete quartets find each other. It is for practical discovery and safer introductions, not for building a public social network.",
      "You can use it to create a singer profile, list an incomplete quartet, search for nearby possibilities, and send an app-mediated first contact request.",
    ],
    heading: "What It Is For",
  },
  {
    body: [
      "A singer profile describes who you are as a singer: your name, parts, goals, experience, availability, travel willingness, and approximate location.",
      "You choose whether the profile appears in public discovery. Hidden profiles stay out of singer search and the map.",
    ],
    heading: "Singer Profiles",
  },
  {
    body: [
      "A quartet listing is for a quartet or prospective quartet that has some parts covered and is looking for one or more singers.",
      "Listings keep covered parts and needed parts separate so searchers can quickly understand what the group needs.",
    ],
    heading: "Quartet Listings",
  },
  {
    body: [
      "Find Quartet Openings shows visible quartet listings from groups looking for missing parts. Find Singers shows visible singer profiles for both individual singers and quartet representatives.",
      "Search and map filters can use public fields like part, goal, country, region, locality, availability, and travel willingness where that data exists.",
      "Search results are useful even when a profile is incomplete, but more complete profiles are easier for others to evaluate.",
    ],
    heading: "Search",
  },
  {
    body: [
      "Public results show approximate places, such as a city or regional area. They do not show exact home addresses, exact coordinates, private postal codes, email addresses, or phone numbers.",
      "Location fields are designed for a global barbershop community, so they are not limited to US ZIP codes or US states.",
    ],
    heading: "Location And Privacy",
  },
  {
    body: [
      "First contact happens through the app. A signed-in user can send a short message, and the recipient can decide whether to respond or share direct contact information.",
      "The app does not show the recipient's private email address or phone number in public search results.",
    ],
    heading: "Contact",
  },
  {
    body: [
      "You can hide a singer profile or quartet listing by turning off its search visibility and saving. Hidden items should disappear from public search and the map.",
      "If you no longer want a profile or listing to be active, keep it hidden until deletion or stronger deactivation controls are added.",
    ],
    heading: "Visibility Controls",
  },
  {
    body: [
      "Use the same judgment you would use when meeting someone through a singing community. Start with app-mediated messages, meet in public or group settings when possible, and do not share private contact details until you are comfortable.",
      "The app helps reduce public exposure of personal data, but it does not replace personal judgment or formal moderation.",
    ],
    heading: "First Contact Safety",
  },
  {
    body: [
      "The public privacy overview explains what is shown, what is kept private, and how approximate location and contact relay behavior work.",
    ],
    heading: "Privacy Page",
  },
  {
    body: [
      "Signed-in users can send private feedback, bug reports, and suggestions from this help page. Feedback is tied to the signed-in account server-side and is not shown publicly.",
    ],
    heading: "Feedback",
  },
];

export const publicPrivacySections = [
  {
    body: [
      "You choose what to put in a singer profile or quartet listing. That can include names, parts, goals, experience, availability, travel willingness, a short description, and approximate location fields.",
      "Do not put private contact details or exact home-location details into public text fields if you do not want other people to see them.",
    ],
    heading: "Information You Add",
  },
  {
    body: [
      "Approximate location helps singers and quartets judge whether an introduction might be practical without exposing exact home-location details.",
      "Public discovery uses city, region, country, or a public location label. It should not show exact coordinates, private postal codes, or private addresses.",
    ],
    heading: "Approximate Location",
  },
  {
    body: [
      "Singer profiles and quartet listings have visibility controls. Visible and active items can appear in public search and the map. Hidden items should stay out of those public discovery views.",
      "The database uses privacy-safe discovery views for public search rather than exposing private base tables directly.",
    ],
    heading: "Visibility",
  },
  {
    body: [
      "Public search results should not show personal email addresses or phone numbers by default.",
      "When someone sends a contact request, the app stores the request, resolves the recipient on the server/database side, and sends a notification without revealing the recipient's email address to the sender.",
    ],
    heading: "Contact Relay",
  },
  {
    body: [
      "Barbershop is global, and the app should be useful outside the United States and Canada. Location handling is approximate and globally tolerant by design.",
      "The app should not require US-only fields like ZIP code or state to make basic discovery useful.",
    ],
    heading: "Global Use",
  },
  {
    body: [
      "This page is a plain-language product overview, not a formal legal privacy policy. A formal policy can be added later when the app is closer to public launch.",
    ],
    heading: "Not A Legal Policy",
  },
];
