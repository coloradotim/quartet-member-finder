export type HelpGuideTopic = {
  body: string[];
  bullets?: string[];
  title: string;
};

export type HelpGuideSection = {
  eyebrow: string;
  id: string;
  intro: string;
  title: string;
  topics: HelpGuideTopic[];
};

export const publicHelpSections: HelpGuideSection[] = [
  {
    eyebrow: "Start here",
    id: "getting-started",
    intro:
      "Quartet Member Finder helps barbershop singers and incomplete quartets find each other through practical, privacy-conscious introductions.",
    title: "Getting Started",
    topics: [
      {
        body: [
          "Use QMF when you want to find quartet openings, find singers for an incomplete quartet, or understand who nearby might be open to singing together.",
          "The app is not a public social network or a directory of personal contact details. It is meant to support safer introductions and enough context for people to decide whether a conversation makes sense.",
        ],
        title: "What the app is for",
      },
      {
        body: [
          "Most people arrive with one immediate goal: they are a singer looking for opportunities, or they represent a quartet looking for one or more singers.",
          "Start with the profile that matches your current goal, or use Find first to understand how discovery works. Your first choice does not lock you into a permanent role.",
        ],
        bullets: [
          "Use My Singer Profile when you personally want quartet opportunities.",
          "Use My Quartet Profile when you represent an incomplete or prospective quartet.",
          "Use Find when you want to search visible profiles and openings after signing in.",
        ],
        title: "What to do first",
      },
      {
        body: [
          "Discovery requires sign-in so browsing, contact, reporting, and feedback are tied to accountable accounts. Help and Privacy remain available before sign-in so you can understand the app before creating a session.",
          "Privacy starts with approximate location, independent visibility controls, and app-mediated Messages instead of exposing private email addresses or phone numbers in discovery.",
        ],
        title: "Why sign-in and privacy matter",
      },
    ],
  },
  {
    eyebrow: "Profiles",
    id: "optional-profiles",
    intro:
      "One account can support two independent optional presences: My Singer Profile and My Quartet Profile.",
    title: "One Account, Two Optional Profiles",
    topics: [
      {
        body: [
          "You can fill out My Singer Profile, My Quartet Profile, both profiles, or neither while you get oriented. You do not need to publish both profiles just because both options exist.",
          "The two profiles are independent. Taking My Singer Profile out of Find does not take My Quartet Profile out of Find, and taking My Quartet Profile out of Find does not take My Singer Profile out of Find.",
        ],
        title: "Use either profile, both, or neither",
      },
      {
        body: [
          "Each profile has its own visibility control. Filling out a profile does not make it discoverable unless you turn visibility on.",
          "Both profiles can be discoverable at the same time if that matches your situation, such as when you personally sing and also represent a quartet looking for another part.",
        ],
        bullets: [
          "Profiles shown in Find can appear in discovery.",
          "Profiles not shown in Find stay out of discovery.",
          "You can turn off Find visibility when you are no longer looking.",
        ],
        title: "Independent visibility",
      },
    ],
  },
  {
    eyebrow: "Your singer presence",
    id: "singer-profile",
    intro:
      "My Singer Profile represents you personally as a singer and helps quartets or other singers decide whether to contact you.",
    title: "My Singer Profile",
    topics: [
      {
        body: [
          "A singer profile can include your display name, parts, goals, experience, availability, travel willingness, and approximate location.",
          "Only display name is required to save the form, but parts, goals, availability, and location make discovery and first contact more useful.",
        ],
        title: "What to include",
      },
      {
        body: [
          "Parts are stored with voicing context. TTBB Tenor, SATB Tenor, and SSAA part labels are not casually treated as the same thing.",
          "Use every part you would be comfortable being contacted about. That helps people avoid guessing from a short bio.",
        ],
        title: "Parts and voicing",
      },
      {
        body: [
          "Keep the profile out of Find while it is incomplete, while you are not open to opportunities, or while you are only using the app as a quartet representative.",
          "If important discovery or location fields are incomplete, your profile can be harder to interpret and may not place well in map or radius search context.",
        ],
        title: "When not to show it in Find",
      },
    ],
  },
  {
    eyebrow: "Your quartet presence",
    id: "quartet-profile",
    intro:
      "My Quartet Profile is for a quartet, incomplete quartet, or prospective quartet you represent.",
    title: "My Quartet Profile",
    topics: [
      {
        body: [
          "Use My Quartet Profile when the group has some parts covered and is looking for one or more singers. The profile should explain enough for a singer to decide whether to start a conversation.",
          "Useful details include covered parts, needed parts, goals, rehearsal expectations, commitment level, availability, travel willingness, and approximate location.",
        ],
        title: "What it represents",
      },
      {
        body: [
          "Covered parts and needed parts are separate. That lets a Lead, Bass, Baritone, or Tenor see whether the opening actually fits before contacting you.",
          "Like My Singer Profile, My Quartet Profile has its own visibility setting. Keep it out of Find when the opening is filled, paused, or not ready for people to discover.",
        ],
        title: "Covered and needed parts",
      },
    ],
  },
  {
    eyebrow: "Discovery",
    id: "find",
    intro:
      "Find is the shared discovery surface for quartet openings and singer profiles.",
    title: "Find Quartet Openings And Find Singers",
    topics: [
      {
        body: [
          "Choose what you are looking for: quartet openings, singers, or both. Use Voice Part(s) and Goal(s) filters when a specific part or set of goals matters.",
          "Find combines filters, a privacy-safe interactive map, and result cards. Result cards give the practical context you need before starting contact.",
        ],
        title: "How Find works",
      },
      {
        body: [
          "Search From can use My Singer Profile location, My Quartet Profile location, or another location you type. Choose a radius and switch between miles and kilometers. Miles are the default display unit.",
          "Radius search uses approximate geocoding and approximate distance. It is meant to answer whether a match is plausibly nearby, not provide exact navigation.",
        ],
        title: "Radius and distance",
      },
      {
        body: [
          "The map is part of Find. It shows privacy-safe approximate regions rather than exact home pins.",
          "Use the map to understand broad geography, then use result cards and Messages for actual introductions.",
        ],
        title: "Map and results",
      },
    ],
  },
  {
    eyebrow: "Location",
    id: "location",
    intro:
      "Location helps people judge practical singing distance without exposing exact home-location details.",
    title: "Location, Radius Search, And Approximate Maps",
    topics: [
      {
        body: [
          "No street address is required. Profile and listing forms ask for globally tolerant fields such as country, state/province/region, city/locality, and ZIP/postal code.",
          "ZIP or postal code can help approximate search and map placement, but it is not shown publicly.",
        ],
        title: "What location fields are for",
      },
      {
        body: [
          "Discovery can show approximate area labels such as a city or region. It should not show exact coordinates, private postal codes, street addresses, private emails, or phone numbers.",
          "Global support is intended. Early defaults are most polished for the United States and Canada, but the app avoids assuming US-only address formats.",
        ],
        title: "What discovery shows",
      },
      {
        body: [
          "Approximate geocoding supports radius search and map placement. If a profile or listing has incomplete location data, it may still be useful but may not place well on the map.",
          "Distance search defaults to miles, with kilometers available when that is more useful.",
        ],
        title: "Limits of approximate search",
      },
    ],
  },
  {
    eyebrow: "Contact",
    id: "messages",
    intro:
      "First contact happens through app-mediated Messages instead of exposing private contact details in discovery.",
    title: "Messages And Contacting Someone",
    topics: [
      {
        body: [
          "When you send a message from a profile or opening, the recipient receives an email notification and signs in to read it. The full message stays behind authenticated app access.",
          "Messages includes Inbox and Sent views so both sides can keep track of contact requests and replies.",
        ],
        title: "What happens when you send a message",
      },
      {
        body: [
          "Users can reply through the app without revealing private email addresses or phone numbers by default. Either person can choose to share direct contact details later if they are comfortable.",
          "Use the same judgment you would use in a singing community: meet in public or group settings when possible, and do not share private details until you are ready.",
        ],
        title: "Replying safely",
      },
    ],
  },
  {
    eyebrow: "Safety",
    id: "privacy-safety",
    intro:
      "Visibility, privacy, and safety controls are built around practical discovery rather than public exposure.",
    title: "Visibility, Privacy, And Safety",
    topics: [
      {
        body: [
          "Profiles shown in Find can appear in discovery. Profiles not shown in Find stay out of discovery. My Singer Profile and My Quartet Profile have separate visibility controls.",
          "Do not put private contact details or exact home-location information in public bio, description, availability, or goal fields.",
        ],
        title: "Shown in Find",
      },
      {
        body: [
          "Discovery should show enough to evaluate a possible match: display names, parts, goals, experience, availability, travel willingness, approximate area, and contact links.",
          "Discovery should not show exact home addresses, exact coordinates, private postal codes, private email addresses, or phone numbers.",
        ],
        title: "What stays private",
      },
      {
        body: [
          "The Privacy page explains the public/private boundary in more detail. Help and Privacy are both available before sign-in.",
        ],
        title: "Where to learn more",
      },
    ],
  },
  {
    eyebrow: "Reports",
    id: "reporting",
    intro:
      "Message reports give users a private way to flag spam, harassment, suspicious requests, or other safety concerns.",
    title: "Reporting Bad Behavior",
    topics: [
      {
        body: [
          "Use Report this message from a message detail page when something is inappropriate, spammy, suspicious, or concerning.",
          "Reports are private and are reviewed as the project team is able. The app does not promise real-time moderation or background checks.",
        ],
        title: "When to report",
      },
      {
        body: [
          "Reported behavior may lead to a profile being hidden from discovery or an account being blocked from sending additional messages.",
          "Ordinary users do not see admin review notes, report history, or internal action details.",
        ],
        title: "What can happen after a report",
      },
    ],
  },
  {
    eyebrow: "FAQ",
    id: "faq",
    intro:
      "These are the most common reasons discovery or contact might feel confusing at first.",
    title: "Troubleshooting And FAQ",
    topics: [
      {
        body: [
          "There may not be many visible profiles yet, your filters may be too narrow, or your selected Search From location and radius may exclude likely matches. Try clearing part filters, increasing the radius, or searching both singers and quartet openings.",
        ],
        title: "Why can't I find any results?",
      },
      {
        body: [
          "Your profile may not be shown in Find, may be incomplete, or may be missing useful location details. Filling out a profile does not publish it; check the visibility setting before expecting it to appear in Find.",
        ],
        title: "Why does my profile not show up?",
      },
      {
        body: [
          "Map and distance search are intentionally approximate. The app avoids exact home-location pins and uses broad area placement for privacy.",
        ],
        title: "Why does my map location look approximate?",
      },
      {
        body: [
          "Yes. One account can have both optional profiles, and neither profile has to be discoverable until you choose to make it visible.",
        ],
        title: "Can I be both a singer and a quartet representative?",
      },
      {
        body: [
          "The recipient gets an email notification, signs in, reads the message in Messages, and can reply through the app. Private email and phone are not shown by default.",
        ],
        title: "What happens when I send a message?",
      },
      {
        body: [
          "Open the message detail page and use Report this message. Choose the closest reason and add a short note if it helps explain the concern.",
        ],
        title: "How do I report a bad message?",
      },
    ],
  },
  {
    eyebrow: "Feedback",
    id: "feedback-guide",
    intro:
      "Feedback helps improve the app while it is still early and practical workflows are being refined.",
    title: "Feedback",
    topics: [
      {
        body: [
          "Useful feedback includes bug reports, confusing behavior, unclear copy, missing location formats, search problems, and suggestions for safer contact workflows.",
          "Signed-in users can send feedback from the bottom of this page. Signed-out users are invited to sign in first so feedback can be tied to an account for follow-up and abuse prevention.",
        ],
        title: "What to send",
      },
    ],
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
      "Singer profiles and quartet profiles have independent visibility controls. Active profiles shown in Find can appear in search and discovery. Profiles not shown in Find should stay out of those discovery views.",
      "Both optional profiles can be discoverable at once when that matches your situation, but neither one has to be discoverable just because it has been filled out.",
      "The database uses privacy-safe discovery views for public search rather than exposing private base tables directly.",
    ],
    heading: "Visibility",
  },
  {
    body: [
      "Public search results should not show personal email addresses or phone numbers by default.",
      "When someone sends a contact request, the app stores the request, resolves the recipient on the server/database side, and sends a notification without revealing the recipient's email address to the sender.",
      "Replies are stored with the original contact request and are visible only to the sender and recipient participants.",
      "Message reports are private. They are visible only to authorized project administrators for review and safety action.",
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
