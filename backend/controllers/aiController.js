const GEMINI_API_KEY = "AIzaSyBuF-I1bT1gCtAmPJAPnP8rBGo1NC6CGsw";

const SYSTEM_PROMPT = `You are the EthioTourism AI Guide, an expert assistant for the Ethiopian Tourism Information System.

Your Goal: Help tourists explore, plan, and book visits to Historical Sites, National Parks, and Cultural Festivals in Ethiopia.

Your Knowledge Base:
- Categories: Historical Sites (e.g., Lalibela, Sof Omar), National Parks (e.g., Bale Mountains), and Cultural Festivals (e.g., Irreecha, Ashenda).
- Data Fields: You know every destination has a Name, Location, Description, Video link, Transportation info from Addis Ababa, Ticket Price, and a Daily Tourist Quota.
- Booking Logic: Users can only book if the 'Daily Quota' is not full.

Your Personality & Rules:
- Be an Ambassador: Speak warmly about Ethiopia's heritage.
- Structure Info: When describing a site, use bullet points for Location, Price, and Transportation.
- Guide the User: If a user is vague, suggest specific sites like 'Lalibela' for history or 'Bale Mountains' for nature.
- Technical Support: If asked how to book, explain: 'Click on the destination card, check the available quota, and click Book.'
- Safety: Do not provide travel advice for restricted areas or make up prices not in the system.`;

// @desc    Chat with AI assistant
// @route   POST /api/v1/ai/chat
// @access  Public
exports.chat = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        message: 'Messages array is required'
      });
    }

    // Detect user role from messages context
    const contextMessage = messages.find(m => m.content?.includes('SUPER_ADMIN') || m.content?.includes('ADMIN') || m.content?.includes('USER'));
    const userRole = contextMessage?.content?.match(/(SUPER_ADMIN|ADMIN|USER)/)?.[1] || 'USER';

    const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';

    // Mock responses based on keywords and role
    let response = '';

    // Role-specific responses
    if (userRole === 'SUPER_ADMIN') {
      if (lastUserMessage.includes('user') || lastUserMessage.includes('manage')) {
        response = `# 👥 User Management

As a Super Admin, you have full control over user and admin management.

## Key Capabilities

### User Management
- 📊 View all registered users
- 🔍 Search and filter users
- 🔄 Reset user passwords
- ❌ Deactivate/activate user accounts
- 📈 Monitor user activity

### Admin Management
- ➕ Create new admin accounts
- 🔐 Manage admin permissions
- 📋 View admin activity logs
- ❌ Remove admin access

### System Analytics
- 📊 Total users: View registration trends
- 📈 Active bookings: Monitor platform usage
- 🎯 Popular destinations: Track user preferences

## Quick Actions

**To manage users:** Navigate to "Manage Users" in the sidebar
**To manage admins:** Navigate to "Manage Admins"
**To view activity:** Check the "Activity Feed" for system logs

Need help with a specific task?`;
      } else if (lastUserMessage.includes('activity') || lastUserMessage.includes('log')) {
        response = `# 📋 Activity Feed & Monitoring

Track all system activities and changes in real-time.

## Activity Types

🟢 **User Activities**
- New registrations
- Password resets
- Account status changes

🔵 **Admin Activities**
- Admin creation/deletion
- Permission changes
- Content updates

🟡 **System Activities**
- Destination updates
- Quota modifications
- Booking management

## Monitoring Tips

- Use filters to focus on specific activity types
- Check timestamps for recent changes
- Review admin actions for audit purposes
- Monitor user patterns for insights

**Pro Tip:** Regular activity monitoring helps maintain platform security and identify issues early.`;
      } else {
        response = `# 🛡️ Super Admin Dashboard

Welcome to your command center! Here's what you can do:

## Your Responsibilities

### 👥 User Oversight
- Manage all user accounts
- Reset passwords when needed
- Monitor user activity

### 🔧 Admin Management
- Create and manage admin accounts
- Assign permissions
- Track admin activities

### 📊 System Analytics
- View platform statistics
- Monitor booking trends
- Track destination popularity

### 🔍 Activity Monitoring
- Review system logs
- Audit admin actions
- Ensure platform security

## Quick Navigation

- **Overview:** System statistics and insights
- **Manage Admins:** Admin account control
- **Manage Users:** User account management
- **Activity Feed:** System activity logs

How can I assist you with platform administration today?`;
      }
    } else if (userRole === 'ADMIN') {
      if (lastUserMessage.includes('destination') || lastUserMessage.includes('add') || lastUserMessage.includes('create')) {
        response = `# ➕ Managing Destinations

As an Admin, you can create and manage all destination content.

## Adding New Destinations

### Historical Sites
1. Navigate to "Historical Sites" in sidebar
2. Click "+ Add New"
3. Fill in required details:
   - Name and location
   - Description and history
   - Images and videos
   - Base price
   - Transportation options
   - Daily quota

### National Parks
- Same process as Historical Sites
- Include wildlife information
- Add trekking routes
- Specify best visiting seasons

### Cultural Festivals
- Add event dates
- Include cultural significance
- Upload festival photos
- Set attendance quotas

## Best Practices

✅ Use high-quality images
✅ Write detailed descriptions
✅ Set realistic daily quotas
✅ Keep transportation info updated
✅ Include accurate pricing

Need help with a specific destination type?`;
      } else if (lastUserMessage.includes('quota') || lastUserMessage.includes('booking')) {
        response = `# 📅 Quota & Booking Management

Manage visitor quotas and monitor bookings effectively.

## Setting Daily Quotas

**For Regular Destinations:**
- Navigate to destination details
- Click "Manage Quota" tab
- Set date and available spots
- Save changes

**For Festivals:**
- Set quota per event day
- Add event name (e.g., "Day 1")
- Monitor booking status

## Monitoring Bookings

### View Bookings
- Check "Bookings" tab on destination page
- Filter by status: Pending, Confirmed, Cancelled
- See user details and booking dates

### Booking Status
- 🟡 **Pending:** Awaiting confirmation
- 🟢 **Confirmed:** Booking approved
- 🔴 **Cancelled:** Booking cancelled

## Tips

- Update quotas regularly
- Monitor popular dates
- Adjust capacity based on demand
- Review booking patterns

What specific aspect would you like help with?`;
      } else {
        response = `# 🎯 Admin Dashboard

Welcome! Here's your content management toolkit:

## Your Capabilities

### 📝 Content Management
- Create new destinations
- Edit existing content
- Upload images and videos
- Update descriptions

### 📊 Quota Management
- Set daily visitor quotas
- Manage festival dates
- Monitor availability

### 📋 Booking Oversight
- View all bookings
- Track booking status
- Monitor visitor numbers

## Quick Actions

**Add Content:**
- Historical Sites → "+ Add New"
- National Parks → "+ Add New"
- Cultural Festivals → "+ Add New"

**Manage Existing:**
- Click any destination to view/edit
- Update quotas in "Manage Quota" tab
- Check bookings in "Bookings" tab

## Categories You Manage

🏛️ **Historical Sites** - Ancient wonders and heritage sites
🏔️ **National Parks** - Natural landscapes and wildlife
🎉 **Cultural Festivals** - Traditional celebrations

How can I help you manage content today?`;
      }
    } else {
      // USER role - existing tourist-focused responses
      if (lastUserMessage.includes('lalibela')) {
        response = `# 🏛️ Lalibela - The Jerusalem of Ethiopia

One of Ethiopia's most sacred cities and a UNESCO World Heritage site, Lalibela is home to 11 extraordinary rock-hewn churches carved directly into the earth in the 12th century.

## 📍 Essential Details

**Location:** Amhara Region, Northern Ethiopia  
**Entry Fee:** ~$50 USD (international visitors)  
**Best Time:** October-March (dry season) | Peak: January (Timkat Festival)

## 🚗 Getting There from Addis Ababa

- ✈️ **Flight:** 1 hour (most convenient)
- 🚌 **Bus:** 10-12 hours (scenic route)
- 🚙 **Private Car:** 8-10 hours

## ✨ Must-See Highlights

🔹 **Bet Giyorgis** - The iconic cross-shaped church  
🔹 **11 Medieval Churches** - Carved from single rock formations  
🔹 **Underground Tunnels** - Connect the sacred sites  
🔹 **Timkat Celebration** - Witness vibrant religious ceremonies in January

## 💡 Pro Tips

- Hire a local guide to understand the rich history
- Wear comfortable shoes for walking between churches
- Bring a flashlight for darker passages
- Respect dress codes (covered shoulders/knees)

---

**Ready to explore?** Check availability and book your spiritual journey on our platform! 🎫`;
      } else if (lastUserMessage.includes('bale') || lastUserMessage.includes('park')) {
        response = `# 🏔️ Bale Mountains National Park

A pristine wilderness paradise showcasing Ethiopia's unique Afro-alpine ecosystem and rare endemic wildlife. Perfect for nature lovers and adventure seekers!

## 📍 Park Information

**Location:** Oromia Region, Southeastern Ethiopia  
**Entry Fee:** 90 ETB (residents) | Higher for international visitors  
**Best Season:** October-March (dry season) | Year-round wildlife viewing

## 🚗 Access from Addis Ababa

- 🚙 **Drive:** 6-7 hours (400 km) - 4WD recommended
- 🛣️ **Route:** Via Shashemene and Dodola

## 🦊 Wildlife & Nature

🐺 **Ethiopian Wolf** - World's rarest canid (only ~500 left)  
🦌 **Mountain Nyala** - Endemic antelope species  
🦅 **200+ Bird Species** - Including rare endemics  
🌿 **Sanetti Plateau** - Highest all-weather road in Africa (4,000m)  
🌲 **Harenna Forest** - Ancient cloud forest ecosystem

## 🎯 Top Activities

- 🥾 Multi-day trekking expeditions
- 📸 Wildlife photography safaris
- 🏕️ Camping under the stars
- 🐦 Bird watching tours
- 🌄 Sunrise at Sanetti Plateau

## 💡 Insider Tips

- Early morning is best for Ethiopian Wolf sightings
- Pack warm layers - temperatures drop significantly at altitude
- Consider hiring a local guide for wildlife tracking
- Bring binoculars for distant wildlife viewing

---

**Adventure awaits!** Book your wilderness experience now and help protect this unique ecosystem. 🌍`;
      } else if (lastUserMessage.includes('book') || lastUserMessage.includes('how')) {
        response = `# 📅 How to Book Your Ethiopian Adventure

Booking with EthioTourism is simple and secure! Follow these easy steps:

## 🎯 Quick Booking Guide

### Step 1: Explore Destinations
Browse our curated collection:
- 🏛️ **Historical Sites** - Lalibela, Axum, Gondar
- 🏔️ **National Parks** - Bale Mountains, Simien Mountains
- 🎉 **Cultural Festivals** - Irreecha, Timkat, Ashenda

### Step 2: Select Your Destination
Click on any destination card to view:
- 📸 Photos and videos
- 📝 Detailed descriptions
- 💰 Pricing information
- 🚗 Transportation options

### Step 3: Check Availability
Monitor the daily visitor quota:
- 🟢 **Green Badge** = Spots available
- 🟡 **Yellow Badge** = Limited availability
- 🔴 **Red Badge** = Fully booked

### Step 4: Choose Your Details
- 📆 Select your preferred date
- 👥 Number of visitors
- 🎫 Ticket type (if applicable)

### Step 5: Confirm & Pay
- ✅ Review your booking details
- 💳 Secure payment processing
- 📧 Instant confirmation email

---

## 💡 Booking Tips

- 📅 Book 2-4 weeks in advance for popular sites
- 🎟️ Festival dates fill up quickly - reserve early
- 📱 Save your booking confirmation
- 🔄 Free cancellation up to 48 hours before

## 🆘 Need Assistance?

I'm here to help with:
- Destination recommendations
- Pricing questions
- Travel planning advice
- Booking support

---

**Ready to start your journey?** Browse destinations now and secure your Ethiopian adventure! 🇪🇹✨`;
      } else {
        response = `# 👋 Welcome to EthioTourism!

I'm your personal AI guide to Ethiopia's most incredible destinations. Let's plan your unforgettable journey together!

## 🎯 What I Can Help You With

### 🏛️ Historical Treasures
Explore ancient wonders like Lalibela's rock-hewn churches, Axum's towering obelisks, and Gondar's royal castles.

### 🏔️ Natural Wonders
Discover pristine wilderness in Bale Mountains and Simien Mountains - home to rare endemic wildlife.

### 🎉 Cultural Experiences
Immerse yourself in vibrant festivals like Irreecha, Timkat, and Ashenda - where tradition comes alive.

### 🗺️ Travel Planning
- 🚗 Transportation options and routes
- 💰 Pricing and budget planning
- 📅 Booking assistance
- 💡 Insider tips and recommendations

---

## 💬 Try Asking Me:

**About Destinations:**
- "Tell me about Lalibela"
- "What wildlife can I see in Bale Mountains?"
- "Which historical sites are must-visit?"

**About Festivals:**
- "When is the Irreecha festival?"
- "What should I wear to Timkat?"
- "Best festivals in August?"

**About Planning:**
- "How do I book a visit?"
- "What's the best time to visit?"
- "How much does it cost?"
- "Transportation from Addis Ababa?"

---

## 🌟 Quick Recommendations

**First-time visitors?** Start with Lalibela + Bale Mountains  
**Culture enthusiasts?** Plan around Timkat or Irreecha  
**Nature lovers?** Bale Mountains + Simien Mountains combo  
**History buffs?** Northern Historical Circuit (Lalibela-Axum-Gondar)

---

**Ready to explore Ethiopia?** Ask me anything - I'm here to make your journey extraordinary! 🇪🇹✨`;
      }
    }

    return res.json({
      success: true,
      message: response,
      model: 'role-aware-assistant'
    });

  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process AI request'
    });
  }
};

    if (lastUserMessage.includes('lalibela')) {
      response = `# 🏛️ Lalibela - The Jerusalem of Ethiopia

One of Ethiopia's most sacred cities and a UNESCO World Heritage site, Lalibela is home to 11 extraordinary rock-hewn churches carved directly into the earth in the 12th century.

## 📍 Essential Details

**Location:** Amhara Region, Northern Ethiopia  
**Entry Fee:** ~$50 USD (international visitors)  
**Best Time:** October-March (dry season) | Peak: January (Timkat Festival)

## 🚗 Getting There from Addis Ababa

- ✈️ **Flight:** 1 hour (most convenient)
- 🚌 **Bus:** 10-12 hours (scenic route)
- 🚙 **Private Car:** 8-10 hours

## ✨ Must-See Highlights

🔹 **Bet Giyorgis** - The iconic cross-shaped church  
🔹 **11 Medieval Churches** - Carved from single rock formations  
🔹 **Underground Tunnels** - Connect the sacred sites  
🔹 **Timkat Celebration** - Witness vibrant religious ceremonies in January

## 💡 Pro Tips

- Hire a local guide to understand the rich history
- Wear comfortable shoes for walking between churches
- Bring a flashlight for darker passages
- Respect dress codes (covered shoulders/knees)

---

**Ready to explore?** Check availability and book your spiritual journey on our platform! 🎫`;
    } else if (lastUserMessage.includes('bale') || lastUserMessage.includes('park')) {
      response = `# 🏔️ Bale Mountains National Park

A pristine wilderness paradise showcasing Ethiopia's unique Afro-alpine ecosystem and rare endemic wildlife. Perfect for nature lovers and adventure seekers!

## 📍 Park Information

**Location:** Oromia Region, Southeastern Ethiopia  
**Entry Fee:** 90 ETB (residents) | Higher for international visitors  
**Best Season:** October-March (dry season) | Year-round wildlife viewing

## 🚗 Access from Addis Ababa

- 🚙 **Drive:** 6-7 hours (400 km) - 4WD recommended
- 🛣️ **Route:** Via Shashemene and Dodola

## 🦊 Wildlife & Nature

🐺 **Ethiopian Wolf** - World's rarest canid (only ~500 left)  
🦌 **Mountain Nyala** - Endemic antelope species  
🦅 **200+ Bird Species** - Including rare endemics  
🌿 **Sanetti Plateau** - Highest all-weather road in Africa (4,000m)  
🌲 **Harenna Forest** - Ancient cloud forest ecosystem

## 🎯 Top Activities

- 🥾 Multi-day trekking expeditions
- 📸 Wildlife photography safaris
- 🏕️ Camping under the stars
- 🐦 Bird watching tours
- 🌄 Sunrise at Sanetti Plateau

## 💡 Insider Tips

- Early morning is best for Ethiopian Wolf sightings
- Pack warm layers - temperatures drop significantly at altitude
- Consider hiring a local guide for wildlife tracking
- Bring binoculars for distant wildlife viewing

---

**Adventure awaits!** Book your wilderness experience now and help protect this unique ecosystem. 🌍`;
    } else if (lastUserMessage.includes('festival') || lastUserMessage.includes('irreecha') || lastUserMessage.includes('ashenda')) {
      response = `# 🎉 Ethiopian Cultural Festivals

Experience Ethiopia's vibrant cultural tapestry through its spectacular festivals - where ancient traditions meet joyful celebration!

## 🌟 Major Festivals

### 🙏 Irreecha (Thanksgiving Festival)

**When:** Late September/Early October  
**Where:** Bishoftu (Debre Zeit) - 45km from Addis Ababa  
**Significance:** Oromo thanksgiving celebration marking the end of rainy season

**What to Expect:**
- 🎊 Millions of participants in traditional attire
- 🎵 Traditional songs and dances
- 🌸 Flower offerings at sacred lakes
- 🌈 Sea of colorful costumes and umbrellas

---

### 👗 Ashenda (Shadey)

**When:** Mid-August (3-day celebration)  
**Where:** Tigray and Amhara regions  
**Significance:** Young women's festival celebrating femininity

**What to Expect:**
- 💃 Groups of young women singing door-to-door
- 🎨 Beautiful traditional dresses (tilfi)
- 🥁 Rhythmic drumming and dancing
- 🎁 Gift exchanges and community feasts

---

### 💧 Timkat (Epiphany)

**When:** January 19-20  
**Where:** Nationwide (Gondar & Lalibela are spectacular)  
**Significance:** Commemoration of Jesus's baptism

**What to Expect:**
- ⛪ Colorful religious processions
- 💦 Holy water blessing ceremonies
- 👑 Priests in ornate ceremonial robes
- 🎶 Ancient chants and traditional music

---

## 📅 Festival Calendar 2026

- **January:** Timkat (Epiphany)
- **August:** Ashenda (Women's Festival)
- **September:** Meskel (Finding of True Cross)
- **September/October:** Irreecha (Thanksgiving)

## 💡 Festival Tips

- Book accommodation well in advance
- Dress respectfully (modest clothing)
- Arrive early for best viewing spots
- Bring sun protection and water
- Respect religious customs and ceremonies

---

**Immerse yourself in Ethiopian culture!** Check our festival calendar and reserve your cultural experience today. 🇪🇹✨`;
    } else if (lastUserMessage.includes('book') || lastUserMessage.includes('how')) {
      response = `# 📅 How to Book Your Ethiopian Adventure

Booking with EthioTourism is simple and secure! Follow these easy steps:

## 🎯 Quick Booking Guide

### Step 1: Explore Destinations
Browse our curated collection:
- 🏛️ **Historical Sites** - Lalibela, Axum, Gondar
- 🏔️ **National Parks** - Bale Mountains, Simien Mountains
- 🎉 **Cultural Festivals** - Irreecha, Timkat, Ashenda

### Step 2: Select Your Destination
Click on any destination card to view:
- 📸 Photos and videos
- 📝 Detailed descriptions
- 💰 Pricing information
- 🚗 Transportation options

### Step 3: Check Availability
Monitor the daily visitor quota:
- 🟢 **Green Badge** = Spots available
- 🟡 **Yellow Badge** = Limited availability
- 🔴 **Red Badge** = Fully booked

### Step 4: Choose Your Details
- 📆 Select your preferred date
- 👥 Number of visitors
- 🎫 Ticket type (if applicable)

### Step 5: Confirm & Pay
- ✅ Review your booking details
- 💳 Secure payment processing
- 📧 Instant confirmation email

---

## 💡 Booking Tips

- 📅 Book 2-4 weeks in advance for popular sites
- 🎟️ Festival dates fill up quickly - reserve early
- 📱 Save your booking confirmation
- 🔄 Free cancellation up to 48 hours before

## 🆘 Need Assistance?

I'm here to help with:
- Destination recommendations
- Pricing questions
- Travel planning advice
- Booking support

---

**Ready to start your journey?** Browse destinations now and secure your Ethiopian adventure! 🇪🇹✨`;
    } else if (lastUserMessage.includes('price') || lastUserMessage.includes('cost')) {
      response = `# 💰 Pricing Guide

Transparent pricing for your Ethiopian adventure. All fees support local communities and conservation efforts!

## 🏛️ Historical Sites

| Destination | Entry Fee | Duration |
|------------|-----------|----------|
| **Lalibela** | ~$50 USD | Full day |
| **Axum** | ~$30 USD | Half day |
| **Gondar** | ~$25 USD | Full day |

## 🏔️ National Parks

| Park | Entry Fee | Best For |
|------|-----------|----------|
| **Bale Mountains** | 90-200 ETB | Wildlife & Trekking |
| **Simien Mountains** | 90-200 ETB | Hiking & Scenery |

*Note: International visitors may have different rates*

## 🎉 Cultural Festivals

✅ **Most festivals are FREE to attend!**  
🎫 Premium viewing areas: 100-500 ETB  
📸 Photography permits: May be required

---

## 💵 Additional Costs to Consider

### Transportation
- 🚌 **Bus:** Most economical option
- 🚙 **Private Car:** Flexible and comfortable
- ✈️ **Domestic Flights:** Time-saving for distant sites

### Services
- 👨‍🏫 **Local Guide:** 500-1,500 ETB/day (highly recommended)
- 🏨 **Accommodation:** 300-3,000 ETB/night (varies by comfort level)
- 🍽️ **Meals:** 50-300 ETB per meal

### Special Permits
- 📸 Video/photography permits at some sites
- 🏕️ Camping permits for national parks

---

## 💡 Money-Saving Tips

- 🎟️ Book combo packages for multiple sites
- 👥 Group bookings often get discounts
- 📅 Visit during shoulder season (April-May, Sept-Oct)
- 🏨 Mix budget and mid-range accommodations
- 🍲 Try local restaurants for authentic & affordable meals

## 💳 Payment Methods

- 💵 Cash (ETB) widely accepted
- 💳 Credit cards at major sites
- 📱 Mobile money gaining popularity

---

**Budget-friendly travel is possible!** Contact us for customized packages that fit your budget. 🌟`;
    } else {
      response = `# 👋 Welcome to EthioTourism!

I'm your personal AI guide to Ethiopia's most incredible destinations. Let's plan your unforgettable journey together!

## 🎯 What I Can Help You With

### 🏛️ Historical Treasures
Explore ancient wonders like Lalibela's rock-hewn churches, Axum's towering obelisks, and Gondar's royal castles.

### 🏔️ Natural Wonders
Discover pristine wilderness in Bale Mountains and Simien Mountains - home to rare endemic wildlife.

### 🎉 Cultural Experiences
Immerse yourself in vibrant festivals like Irreecha, Timkat, and Ashenda - where tradition comes alive.

### 🗺️ Travel Planning
- 🚗 Transportation options and routes
- 💰 Pricing and budget planning
- 📅 Booking assistance
- 💡 Insider tips and recommendations

---

## 💬 Try Asking Me:

**About Destinations:**
- "Tell me about Lalibela"
- "What wildlife can I see in Bale Mountains?"
- "Which historical sites are must-visit?"

**About Festivals:**
- "When is the Irreecha festival?"
- "What should I wear to Timkat?"
- "Best festivals in August?"

**About Planning:**
- "How do I book a visit?"
- "What's the best time to visit?"
- "How much does it cost?"
- "Transportation from Addis Ababa?"

---

## 🌟 Quick Recommendations

**First-time visitors?** Start with Lalibela + Bale Mountains  
**Culture enthusiasts?** Plan around Timkat or Irreecha  
**Nature lovers?** Bale Mountains + Simien Mountains combo  
**History buffs?** Northern Historical Circuit (Lalibela-Axum-Gondar)

---

**Ready to explore Ethiopia?** Ask me anything - I'm here to make your journey extraordinary! 🇪🇹✨`;
    }

    return res.json({
      success: true,
      message: response,
      model: 'mock-assistant'
    });

  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process AI request'
    });
  }
};
