export const publicHelpSections = [
  {
    body: [
      "Quartet Member Finder helps barbershop singers and incomplete quartets find each other. It is for practical discovery and safer introductions, not for building a public social network.",
      "One account can support My Singer Profile, My Quartet Profile, or both. You can use either optional profile without choosing a permanent role.",
    ],
    heading: "What It Is For",
  },
  {
    body: [
      "A singer profile describes who you are as a singer: your name, parts, goals, experience, availability, travel willingness, and approximate location.",
      "Parts are grouped by voicing, so TTBB Tenor, SATB Tenor, and SSAA part labels stay distinct in discovery.",
      "Only display name is required; the optional details help others decide whether a contact request makes sense.",
      "You choose whether My Singer Profile appears in discovery. Hidden singer profiles stay out of singer search and Find, and hiding it does not hide My Quartet Profile.",
    ],
    heading: "Singer Profiles",
  },
  {
    body: [
      "After sign-in, onboarding first asks for basic profile context like display name, country, and approximate location.",
      "Then you choose what you are here to do first. That choice is not permanent; you can use My Singer Profile, My Quartet Profile, Find, and Help later.",
    ],
    heading: "First Sign-In",
  },
  {
    body: [
      "My Quartet Profile is for a quartet or prospective quartet that has some parts covered and is looking for one or more singers.",
      "It keeps covered parts and needed parts separate within the quartet's voicing so searchers can quickly understand what the group needs.",
      "You choose whether My Quartet Profile appears in discovery. Hidden quartet profiles stay out of quartet search and Find, and hiding it does not hide My Singer Profile.",
    ],
    heading: "Quartet Profiles",
  },
  {
    body: [
      "Find is the main discovery page. It combines filters, a privacy-safe interactive map, and result cards for quartet openings and singer profiles.",
      "Use the looking-for filter to focus on quartet openings when you are a singer, or singer profiles when you are representing a quartet or looking for other singers.",
      "Part filters include voicing context, including TTBB, SSAA, and SATB / mixed labels.",
      "Search from a typed place or your saved singer profile location, choose a radius, and switch between miles and kilometers. Radius search uses approximate distance when geocoding is configured.",
      "The map is part of Find rather than a separate first step. It helps you scan approximate activity, then the result cards give names, parts, type, distance when available, and contact links.",
      "Detailed singer and quartet search pages remain available when you need more specific filters like availability, experience, or travel willingness.",
      "Search results are useful even when a profile is incomplete, but more complete profiles are easier for others to evaluate.",
    ],
    heading: "Search",
  },
  {
    body: [
      "Discovery results show approximate places, such as a city or regional area. They do not show exact home addresses, exact coordinates, private postal codes, email addresses, or phone numbers.",
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
      "Discoverable means a profile can appear in Find results and approximate map discovery inside Find. Hidden means it stays out of discovery.",
      "My Singer Profile and My Quartet Profile have independent visibility controls. You can make either one discoverable, both discoverable, or neither discoverable.",
      "Filling out a profile does not require making it discoverable. If you are no longer looking personally, hide My Singer Profile; if the quartet opening is no longer active, hide My Quartet Profile.",
    ],
    heading: "Visibility Controls",
  },
  {
    body: [
      "Country is the first location cue because it helps the app use sensible labels, such as ZIP code, postcode, state, province, or region, without strict address validation.",
      "Profile and listing forms ask for country, state/province/region, city/locality, and ZIP/postal code instead of country codes or street addresses. ZIP/postal codes are not shown in discovery.",
      "Find defaults distance display to miles and lets you switch to kilometers when that is more useful. If your singer profile has a saved approximate location, Find can use it as the search origin.",
    ],
    heading: "Location Defaults",
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
      "My Singer Profile and My Quartet Profile are optional and have independent visibility controls. Filling out one does not publish the other.",
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
      "Singer profiles and quartet profiles have independent visibility controls. Discoverable and active profiles can appear in search and Find. Hidden profiles should stay out of those discovery views.",
      "Both optional profiles can be discoverable at once when that matches your situation, but neither one has to be discoverable just because it has been filled out.",
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
      "The app should not require US-only fields like state or exact street address to make basic discovery useful.",
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
