/* The floor exam — then a named certificate. */

export const QUIZ = [
  { q: "What is the primary structural component of every Hike insole?", difficulty: "easy", after: "meet-insole", options: ["The top cover","The 3D-printed base","The cork base","The wedge slab"], answer: 1, correct: "Correct!", wrong: "Not quite.", explanation: "The base of the insole is the 3D-printed structural foundation. The top cover is glued on top of it. A shell is only Hike Shell — 3/4 length. Everyday, Sport, Flexible Shell, UCBL, and the Sweets are bases, not shells." },
  { q: "What is Hike Medical's SLA for shipping a finished insole out of the facility?", difficulty: "easy", after: "production-flow", options: ["3 business days","7 business days","5 business days","10 business days"], answer: 2, correct: "That's right!", wrong: "Not quite — it's 5 business days.", explanation: "Hike ships every finished insole out of the facility within 5 business days of receiving the order." },
  { q: "What are the two primary orthotic types Hike produces?", difficulty: "easy", after: "meet-insole", options: ["Sport and Everyday","Functional and Diabetic","Shell and UCBL","Clinical and Consumer"], answer: 1, correct: "Correct!", wrong: "Not quite — those are order types or base types, not orthotic types.", explanation: "Hike produces Functional orthotics focused on biomechanical correction, and Diabetic orthotics engineered for pressure offloading and skin protection." },
  { q: "Which top cover T-code is the thinnest available?", difficulty: "easy", after: "top-cover", options: ["T8","T11","T5","T13"], answer: 2, correct: "Correct!", wrong: "Not quite — T5 Vinyl at 1.0 mm is the thinnest.", explanation: "T5 is Vinyl at 1.0 mm — the thinnest top cover in the library. Used only when the shoe has no room for a thicker cover." },
  { q: "What is the default top cover for a Hike UCBL?", difficulty: "easy", after: "ucbl", options: ["T1 — 1/8\" P-Cell","T6 — Spenco","T4 — Preferred Puff over Poron","T7 — 1/8\" Puff"], answer: 3, correct: "That's right!", wrong: "Not quite — the UCBL default is T7, 1/8\" Puff.", explanation: "The standard default top cover for the Hike UCBL is T7 — a single layer of 1/8\" Puff foam." },
  { q: "Which diabetic base is paired with the T2 top cover?", difficulty: "easy", after: "diabetic-inserts", options: ["Hike Diabetic 35 — Sweet","Hike Diabetic 55 — Triple Sweet","Hike Diabetic 45 — Double Sweet","Hike Flexible Shell"], answer: 2, correct: "Correct!", wrong: "Not quite — T2 pairs with the Double Sweet (Diabetic 45).", explanation: "The Double Sweet (Diabetic 45) is paired with T2 — a two-layer cover of 1/16\" P-Cell over 1/16\" Poron." },
  { q: "What is the difference between a Clinical order and a Consumer order?", difficulty: "medium", after: "order-flows", options: ["Clinical orders are faster to produce","Consumer orders involve a clinician specifying all accommodations","Clinical orders are submitted by a licensed clinician with full specifications; consumer orders have no clinician involvement","There is no difference — both follow the same workflow"], answer: 2, correct: "Exactly right!", wrong: "Not quite — the key difference is clinician involvement and specification detail.", explanation: "Clinical orders are submitted by licensed clinicians with full Rx specifications. Consumer orders have no clinician — the design team determines arch sizing from the scan." },
  { q: "What does UCBL stand for?", difficulty: "easy", after: "ucbl", options: ["Universal Corrective Base Layer","University of California Biomechanics Laboratory","Upper Calcaneal Bearing Liner","Unified Cushion Base Liner"], answer: 1, correct: "That's right!", wrong: "Not quite — it stands for University of California Biomechanics Laboratory.", explanation: "UCBL stands for University of California Biomechanics Laboratory — where the high-wall rearfoot control base design originated." },
  { q: "What material is the Hike Corkbase made from?", difficulty: "easy", after: "hike-corkbase", options: ["TPU with a cork top layer","Cork composite as the base itself","Nylon with cork infill","Standard TPU with cork coating"], answer: 1, correct: "Correct!", wrong: "Not quite — the base itself is cork, not a TPU print with a cork layer.", explanation: "Corkbase is cork as the actual base material — not a TPU print with a cork layer on top. It is a base, not a shell." },
  { q: "What is the correct order of production steps after a clinical order is designed?", difficulty: "medium", after: "production-flow", options: ["Print → Glue → QC → Finish → Ship","Print → Glue → Finish → QC → Ship","Glue → Print → Finish → QC → Ship","Print → Finish → Glue → QC → Ship"], answer: 1, correct: "Perfect!", wrong: "Not quite — finishing happens before QC, not after gluing directly.", explanation: "The correct production flow is: Design → Print → Glue top cover → Finish edges → QC → Ship. Nothing leaves without QC sign-off." },
  { q: "What does a Medial Wedge correct?", difficulty: "easy", after: "end", options: ["Supination — the heel rolling outward","Overpronation — the heel rolling inward","Leg length discrepancy","Forefoot varus"], answer: 1, correct: "Correct!", wrong: "Not quite — medial raises the inner border to correct overpronation.", explanation: "A Medial Wedge raises the inner border to stop the heel rolling inward — the correction for valgus and overpronation." },
  { q: "What is the key build rule for a Morton's Extension that must never be violated?", difficulty: "hard", after: "gait-plate", options: ["The extension must always taper thin toward the tip","The base edge must stay full thickness all the way to the tip — no taper","The extension must cover all five rays","The extension must be glued separately after printing"], answer: 1, correct: "Exactly right — this is critical!", wrong: "Not quite — thinning the edge defeats the entire accommodation.", explanation: "The base edge under a Morton's Extension must stay full thickness to the tip. If thinned or tapered, the rigid lever arm disappears and the whole accommodation stops working." },
  { q: "What is the T3 top cover recipe?", difficulty: "medium", after: "diabetic-inserts", options: ["1/8\" P-Cell only","1/16\" P-Cell over 1/16\" Poron","1/8\" P-Cell over 1/16\" Poron","1/8\" Poron only"], answer: 2, correct: "Correct!", wrong: "Not quite — T3 is 1/8\" P-Cell over 1/16\" Poron, the thickest diabetic cover.", explanation: "T3 is 1/8\" P-Cell over 1/16\" Poron — the thickest diabetic cover at approximately 4.8 mm, paired with the Triple Sweet (Diabetic 55) base." },
  { q: "What does a U-shaped heel post do that makes it different from an Oval post?", difficulty: "medium", after: "heel-post-stabilizer", options: ["It raises both medial and lateral borders simultaneously","It leaves the center of the heel unloaded so a painful structure floats free","It provides the most aggressive rearfoot control","It is only used on diabetic devices"], answer: 1, correct: "That's right!", wrong: "Not quite — the defining feature of the U post is the open center that floats the heel.", explanation: "The U post cradles the heel on both sides while leaving the center unloaded — used when the patient has central heel pain, a spur, or a sensitive structure that cannot bear direct pressure." },
  { q: "Hike Sport and Hike Everyday are:", difficulty: "easy", after: "hike-sport", options: ["The same base — the name is only a label","Both co-poly functional bases, but Sport carries more support than Everyday","Different materials — Sport is cork, Everyday is EVA","Sport is diabetic; Everyday is functional"], answer: 1, correct: "Correct!", wrong: "Not quite — both are co-poly functional bases, but they are not identical. Sport is the higher-support version.", explanation: "Sport and Everyday are both co-poly functional bases. Sport carries more support for active patients. Everyday is the flexible version for everyday wear, comfort with support, and first-time users." },
  { q: "When do you choose Hike Shell instead of Everyday or Sport?", difficulty: "medium", after: "hike-shell", options: ["For diabetic accommodation at 35 durometer","For a traditional thin co-poly profile in a low-volume shoe","When the patient wants a cork feel","When you need UCBL-level heel walls"], answer: 1, correct: "Correct!", wrong: "Not quite — Hike Shell is the thin 3/4 co-poly look for low-volume shoes.", explanation: "Hike Shell is the only shell — 3/4 length. It behaves like a thin co-poly. Choose it for a traditional thin profile and low-volume shoes. Everyday and Sport are co-poly functional bases. Flexible Shell is an insole base, not a shell. Corkbase is thermal cork." },
  { q: "Which reinforcement pattern is mutually exclusive with all other reinforcement patterns?", difficulty: "medium", after: "reinforcement-arch-ribs", options: ["Radial Fan","Isogrid","Ribbed","Arch Ribs"], answer: 2, correct: "That's right!", wrong: "Not quite — Ribbed is the one that removes all other patterns when enabled.", explanation: "Enabling Ribbed reinforcement removes the other three patterns. It is mutually exclusive with Radial Fan, Isogrid, and Arch Ribs." },
  { q: "What is the verb for every heel post?", difficulty: "easy", after: "heel-post-stabilizer", options: ["RELIEVE","SOFTEN","RAISE","STIFFEN"], answer: 2, correct: "Correct!", wrong: "Not quite — heel posts are always a RAISE.", explanation: "Every heel post is a RAISE — you are adding material under the heel to change its angle or height." },
  { q: "What is the difference between an extrinsic and intrinsic wedge?", difficulty: "medium", after: "end", options: ["Extrinsic is medial; intrinsic is lateral","Extrinsic is a separate printed part under the base; intrinsic is built into the base geometry","Extrinsic is cork; intrinsic is printed TPU","There is no difference"], answer: 1, correct: "Exactly right!", wrong: "Not quite — the distinction is where the tilt lives: outside the base or inside it.", explanation: "Extrinsic wedge = a separate printed TPU slab under a flat-bottomed base. Intrinsic = correction baked directly into the base geometry during design. Same clinical goal, different build method." },
  { q: "What is P-Cell foam primarily used for?", difficulty: "easy", after: "top-cover", options: ["Athletic spring and energy return","Pure shock absorption on functional bases","Cushioning and friction reduction for high-risk diabetic skin","Structural stiffening of the base"], answer: 2, correct: "Correct!", wrong: "Not quite — P-Cell is for diabetic skin protection and friction reduction.", explanation: "P-Cell is the soft foam the foot touches on diabetic builds — designed for cushioning and friction reduction for high-risk skin. Used on T1, T2, T3, and T11." },
  { q: "A Morton's Extension is mutually exclusive with which other accommodation?", difficulty: "medium", after: "gait-plate", options: ["Gait Plate","Heel Post","Reverse Morton's Extension","Met Pad"], answer: 2, correct: "That's right!", wrong: "Not quite — both reshape the same front edge in opposite directions.", explanation: "Morton's Extension and Reverse Morton's Extension are mutually exclusive — both reshape the same distal trimline in opposite directions and cannot coexist on the same base." },
  { q: "What does the Radial Fan reinforcement pattern follow?", difficulty: "hard", after: "reinforcement-arch-ribs", options: ["The metatarsal parabola across the forefoot","The plantar fascia's own load path from the calcaneal tubercle","The navicular line from heel to first met","Parallel lines across the full plate"], answer: 1, correct: "Exactly right!", wrong: "Not quite — the rays follow the plantar fascia load path from the calcaneal tubercle.", explanation: "The Radial Fan spreads from the calcaneal tubercle in a full 360° pattern, following the plantar fascia's own load paths — the most anatomically intelligent reinforcement in the library." },
  { q: "What is the key distinction between a Met Pad and a Met Bar?", difficulty: "medium", after: "end", options: ["Met Pad is for diabetic orders only; Met Bar is for functional","Met Pad is a softer symmetric dome; Met Bar is a precise structural ridge with a fixed silhouette","Met Pad sits under the met heads; Met Bar sits behind them","They are interchangeable — same clinical result"], answer: 1, correct: "Correct!", wrong: "Not quite — both sit behind the heads, but their structure and clinical use differ.", explanation: "The Met Pad is a softer, more accommodative symmetric dome. The Met Bar is a precise, structured ridge with a fixed digitized silhouette. Both sit proximal to the met heads and are mutually exclusive." },
  { q: "What does the Tarsal Tunnel Groove modify on the insole?", difficulty: "hard", after: "end", options: ["The plantar surface under the arch","The medial heel cup wall","The heel seat surface","The forefoot trimline"], answer: 1, correct: "That's right!", wrong: "Not quite — it modifies the medial wall of the heel cup, not the plantar surface.", explanation: "The Tarsal Tunnel Groove is scooped from the medial heel cup wall — not the plantar surface. The insole body is untouched. Only the wall is modified to relieve pressure on the tarsal tunnel." },
  { q: "Which of the four production verbs applies to a Drill and Fill?", difficulty: "medium", after: "end", options: ["RAISE","RELIEVE","STIFFEN","SOFTEN"], answer: 3, correct: "Correct!", wrong: "Not quite — Drill and Fill softens the contact zone, it does not remove it.", explanation: "Drill and Fill is SOFTEN — it replaces hard base contact with soft material (P-Cell or Poron) at a met head zone, cushioning rather than removing contact entirely." },
  { q: "How many Arch Ribs does SoleGen place under the arch by default?", difficulty: "medium", after: "reinforcement-arch-ribs", options: ["2","6","4","8"], answer: 2, correct: "Correct!", wrong: "Not quite — four ribs is the default.", explanation: "Arch Ribs default to four longitudinal ribs laid along the navicular line — from the medial heel cup to MT1 — the direction the arch actually spans." },
  { q: "In a Gait Plate for an in-toeing patient, which side gets the extension?", difficulty: "medium", after: "end", options: ["Medial side","Lateral side","Both sides equally","Neither — the front edge is cut back on both sides"], answer: 1, correct: "That's right!", wrong: "Not quite — in-toeing always gets the lateral extension.", explanation: "In-toeing gets the extension on the lateral side, so the foot rolls outward during push-off. Out-toeing gets the medial extension." },
  { q: "What does the Heel Fill do differently from the Heel Pad?", difficulty: "hard", after: "end", options: ["Heel Fill cuts a soft insert into the base; Heel Pad builds the seat surface up","Heel Fill builds the seat surface up; Heel Pad cuts a soft insert into the thickness","They are the same accommodation with different names","Heel Fill is only for diabetic devices; Heel Pad is for functional"], answer: 1, correct: "Exactly right!", wrong: "Not quite — Fill raises the surface; Pad softens the material within the thickness.", explanation: "Heel Fill builds the heel seat upward — RAISE. Heel Pad cuts a soft insert into the base thickness — SOFTEN. Same heel zone, opposite approach." },
  { q: "Which scan method is the most commonly used to initiate a Hike order?", difficulty: "easy", after: "order-flows", options: ["Scan Impression Box","Structure Sensor Foot Scan","Ship Impression Box","Hike Scan"], answer: 3, correct: "Correct!", wrong: "Not quite — Hike Scan is the dominant method across all order types.", explanation: "Hike Scan is by far the most commonly used casting method — accounting for the large majority of orders across both diabetic and functional orthotic types." },
  { q: "A Reverse Dancer's Pad offloads which metatarsal head?", difficulty: "medium", after: "end", options: ["MT1 — first metatarsal head","MT3 — third metatarsal head","MT5 — fifth metatarsal head","MT2 and MT3 combined"], answer: 2, correct: "Correct!", wrong: "Not quite — the Reverse Dancer's offloads MT5 on the lateral side.", explanation: "The Reverse Dancer's Pad offloads MT5 — the fifth metatarsal head on the lateral forefoot. The standard Dancer's Pad offloads MT1." },
  { q: "What is the default angle for both printed medial and lateral wedges?", difficulty: "medium", after: "end", options: ["2°","6°","4°","8°"], answer: 2, correct: "That's right!", wrong: "Not quite — default is 4° for both wedge types.", explanation: "The default angle for both the printed Medial and Lateral Wedge is 4°. At 0° no part is generated at all." },
  { q: "How is an extrinsic wedge built on a printed Hike insole?", difficulty: "hard", after: "end", options: ["A cork blank is glued by hand under a flat base","A separate TPU slab is printed and sits under a flat-bottomed base","The tilt is ground into the base after printing","The top cover is stacked thicker on one border"], answer: 1, correct: "Correct!", wrong: "Not quite — extrinsic wedges are printed TPU slabs, not hand-glued cork.", explanation: "An extrinsic wedge is a separate printed TPU slab. The base prints flat and untilted; the angle lives in the slab underneath. Hike no longer glues cork wedges." },
  { q: "What does a Neuroma Pad treat and where is it positioned?", difficulty: "medium", after: "end", options: ["Heel pain — centered under the calcaneus","Arch collapse — centered under the navicular","A pinched nerve between met heads — just proximal and slightly medial to the affected webspace","Met head pressure — directly under the metatarsal heads"], answer: 2, correct: "Exactly right!", wrong: "Not quite — it targets the intermetatarsal nerve, positioned just proximal to the webspace.", explanation: "A Neuroma Pad treats a Morton's neuroma — a pinched nerve between met heads, classically the 3rd webspace. It sits just proximal and slightly medial to that space to gently spread the heads apart." },
  { q: "What is the Isogrid reinforcement pattern based on?", difficulty: "hard", after: "reinforcement-arch-ribs", options: ["Parallel transverse corrugation","Radial spokes from a central point","Three rib families 60° apart forming equilateral triangles","Four longitudinal ribs along the navicular line"], answer: 2, correct: "Correct!", wrong: "Not quite — three rib families at 60° forming triangles is the Isogrid pattern.", explanation: "Isogrid uses three rib families oriented 60° apart, forming equilateral triangles — the aerospace standard for thin plates. It is quasi-isotropic, carrying torsion in all directions equally." },
  { q: "What happens at the finishing wheel in production?", difficulty: "easy", after: "production-flow", options: ["The top cover is glued to the base","The base is 3D printed","The edges of the insole are ground smooth","QC inspection is performed"], answer: 2, correct: "That's right!", wrong: "Not quite — the finishing wheel is where edges are ground smooth after gluing.", explanation: "At the finishing wheel, the edges of the insole are ground smooth after gluing, bringing the pair to the clean finished look and feel that Hike's quality standard requires." },
  { q: "Which verb governs a Morton's Extension?", difficulty: "medium", after: "gait-plate", options: ["RAISE","RELIEVE","SOFTEN","STIFFEN"], answer: 3, correct: "Correct!", wrong: "Not quite — Morton's Extension blocks joint motion, which is STIFFEN.", explanation: "A Morton's Extension STIFFENs — it blocks motion at the 1st MPJ by providing a rigid lever arm the joint cannot bend against." },
  { q: "What is Poron foam primarily used for in top covers?", difficulty: "easy", after: "top-cover", options: ["Skin friction reduction on diabetic feet","Shock absorption and durability","Athletic spring and energy return","Structural stiffening of the base"], answer: 1, correct: "Correct!", wrong: "Not quite — Poron's job is shock absorption and durability.", explanation: "Poron is a denser foam used for shock absorption and durability. It goes under P-Cell on T2 and T3, and is used alone for pure shock control on T13 and T14." },
  { q: "What makes a Charcot foot device different from a standard insole?", difficulty: "hard", after: "end", options: ["It uses the firmest base durometer available","It is molded to mirror the collapsed midfoot anatomy for total contact — no corrections","It has the most accommodations of any device type","It always includes a T3 top cover"], answer: 1, correct: "Exactly right!", wrong: "Not quite — Charcot devices use total contact and no corrections.", explanation: "A Charcot device mirrors the collapsed rocker-bottom anatomy for total contact with no aggressive corrections. Nothing is added or cut — the surface itself is the treatment." },
  { q: "The 1st Ray Cutout has which shaped bite out of the base?", difficulty: "medium", after: "gait-plate", options: ["Straight oblique cut on the medial edge","Round bite out of the medial front corner","Oval relief at the metatarsal head","Straight cut across the full forefoot"], answer: 1, correct: "Correct!", wrong: "Not quite — it's a round bite on the medial front corner.", explanation: "The 1st Ray Cutout is a round bite out of the medial front corner of the base, centered there and reaching behind the MT line toward the heel." },
  { q: "What does rearfoot posting being 'intrinsic' mean?", difficulty: "medium", after: "end", options: ["The post is added as a separate printed part under the base","The post is a hand-glued cork blank","The tilt is built directly into the base geometry during design","The post is only applied to the forefoot zone"], answer: 2, correct: "That's right!", wrong: "Not quite — intrinsic means the tilt is inside the base geometry from the start.", explanation: "Intrinsic means the correction is baked into the base geometry itself during design — no separate part, no hand gluing. The base prints with the angle already in it." },
  { q: "Both medial and lateral flanges together on the same device creates what?", difficulty: "medium", after: "end", options: ["A Charcot device","The defining geometry of a UCBL","A Hike Flexible Shell","Hike Shell"], answer: 1, correct: "Correct!", wrong: "Not quite — medial and lateral flanges together defines the UCBL geometry.", explanation: "Both medial and lateral flanges running simultaneously is the defining geometry of a UCBL — the tall walls on both sides fully enclosing the rearfoot." },
  { q: "What is the default depth of a PT Groove?", difficulty: "hard", after: "end", options: ["7 mm","2 mm","4 mm","10 mm"], answer: 2, correct: "Correct!", wrong: "Not quite — PT Groove default depth is 4 mm.", explanation: "The PT Groove default depth is 4 mm, with a long and thin oval footprint (aspect ratio ~3.7) running along the peroneus/plantar tendon course." },
  { q: "A Stabilizer heel post is prescribed when:", difficulty: "medium", after: "heel-post-stabilizer", options: ["The patient has central heel pain or a spur","Maximum rearfoot stability and control is needed","A uniform heel height lift is required","General rearfoot correction without aggressive bias is needed"], answer: 1, correct: "That's right!", wrong: "Not quite — the Stabilizer is for maximum rearfoot control.", explanation: "The Stabilizer is the most controlling heel post — prescribed for significant instability or hypermobility where the heel needs to be firmly held with maximum resistance to rolling." },
  { q: "Which top cover T-codes are in the same material family?", difficulty: "hard", after: "top-cover", options: ["T1 and T14","T6 and T9","T4 and T7","T5 and T11"], answer: 1, correct: "Correct!", wrong: "Not quite — T6 and T9 are the same athletic spring material family.", explanation: "T6 (1/8\" Spenco) and T9 (1/16\" Neo Sponge) are the same sheet material family — athletic spring — just at different thicknesses." },
  { q: "What is the default height of a medial flange on a standard insole plate?", difficulty: "hard", after: "end", options: ["20 mm","25 mm","30 mm","35 mm"], answer: 2, correct: "Correct!", wrong: "Not quite — medial plate flange defaults to 30 mm.", explanation: "The medial flange on a standard plate defaults to 30 mm — the tallest of the four flange types, because it holds the arch and needs the most height and wall depth." },
  { q: "What does Hike Shell (Co-Poly Mimic) replicate?", difficulty: "medium", after: "hike-shell", options: ["The feel of cork underfoot","The stiffness and response of traditional copolymer","The flexibility of the Hike Flexible Shell","The deep heel cup of the UCBL"], answer: 1, correct: "That's right!", wrong: "Not quite — it mimics the stiffness and response of traditional copolymer.", explanation: "Hike Shell is the 3/4-length TPU shell engineered to replicate the stiffness and response of traditional copolymer." },
  { q: "On a full-length functional base, how do you read a Met Bar + Met Head Offload + Arch Reinforcement?", difficulty: "hard", after: "end", options: ["RAISE + RAISE + RAISE","SOFTEN + RELIEVE + STIFFEN","RAISE + RELIEVE + STIFFEN","STIFFEN + SOFTEN + RAISE"], answer: 2, correct: "Exactly right!", wrong: "Not quite — Met Bar raises, Offload relieves, Arch Reinforcement stiffens.", explanation: "Met Bar = RAISE (redirects load off met heads). Met Head Offload = RELIEVE (removes contact at one head). Arch Reinforcement = STIFFEN (makes the medial wall more resistant). Three verbs, three jobs — on a full-length base. A Hike Shell cannot carry the met bar or the met offload." },
  { q: "Which offloads can be built on a Hike Shell?", difficulty: "medium", after: "end", options: ["Any met head offload, 1st through 5th","Base of 5th and 1st ray cut out","Met Pad and Met Bar","None — a shell takes no offloads"], answer: 1, correct: "Correct!", wrong: "Not quite — the 3/4 shell ends at the met line. Only Base of 5th and 1st ray cut out.", explanation: "Hike Shell is 3/4 length and ends at the metatarsal line. The offloads it can carry are Base of 5th and 1st ray cut out. Met head offloads, plugs, Drill & Fill, met pads, and met bars belong to full-length bases." },
  { q: "What is the Sensory Bumps default layout?", difficulty: "hard", after: "end", options: ["8 bumps evenly spaced across the forefoot","16 bumps — 5 at the toes, two diagonals of 3 down the midfoot, 5 at the heel","12 bumps across the full plantar surface","20 bumps following the metatarsal parabola"], answer: 1, correct: "Correct!", wrong: "Not quite — the fixed layout is 16 bumps across three anatomical zones.", explanation: "Sensory Bumps have a fixed 16-bump anatomical layout — 5 along the toe contour, two diagonal rows of 3 down the midfoot, and 5 clustered on the heel." },
  { q: "Which correctly describes Met Head Offload vs Drill and Fill?", difficulty: "hard", after: "end", options: ["Both remove contact entirely at the met head","Offload removes contact via a well and plug; Drill and Fill is a full-depth aperture through the cover, backfilled flush","Drill and Fill removes contact; Offload softens the zone","They are identical — just different names"], answer: 1, correct: "Perfect — that's the critical distinction!", wrong: "Not quite — offload removes contact via a well; Drill and Fill keeps a continuous walking surface.", explanation: "Met Head Offload cuts a well into the base with a soft plug — the head never contacts the insole. Drill and Fill is a full-depth aperture through the top cover, backfilled with softer foam. The surface looks flush. Pressure is pushed outward. Mutually exclusive on any given head." },
];

const LETTERS = ['A', 'B', 'C', 'D'];
const TOTAL = QUIZ.length;
const SAVE_KEY = 'hikeQuizProgress';

const quizState = {
  mode: null,
  queue: [],
  cursor: 0,
  answers: {},
  answered: false,
  done: false,
  onCheckDone: null,
  name: localStorage.getItem('hikeCertName') || '',
};

(function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    if (saved?.answers && typeof saved.answers === 'object') quizState.answers = saved.answers;
    if (saved?.done) quizState.done = true;
  } catch { /* ignore */ }
})();

function persistProgress() {
  localStorage.setItem(SAVE_KEY, JSON.stringify({
    answers: quizState.answers,
    done: quizState.done,
  }));
}

function liveScore() {
  return Object.values(quizState.answers).filter(Boolean).length;
}

function currentIndex() {
  return quizState.queue[quizState.cursor];
}

function pendingAfter(lessonId) {
  return QUIZ.map((q, i) => i).filter(i => QUIZ[i].after === lessonId && !(String(i) in quizState.answers));
}

function unanswered() {
  return QUIZ.map((_, i) => i).filter(i => !(String(i) in quizState.answers));
}

function setCheckChrome(on) {
  $('quiz')?.classList.toggle('check', !!on);
}

export function hasCheckpoint(lessonId) {
  return pendingAfter(lessonId).length > 0;
}

export function startCheckpoint(lessonId, { onDone } = {}) {
  const queue = pendingAfter(lessonId);
  if (!queue.length) return false;
  quizState.mode = 'check';
  quizState.queue = queue;
  quizState.cursor = 0;
  quizState.answered = false;
  quizState.onCheckDone = onDone || null;
  setCheckChrome(true);
  setPanel('ask');
  renderQuestion();
  return true;
}

function $(id) { return document.getElementById(id); }

function persistCert(name, score) {
  const record = {
    name,
    score: Math.max(0, Math.min(TOTAL, score)),
    total: TOTAL,
    pct: Math.round((Math.max(0, Math.min(TOTAL, score)) / TOTAL) * 100),
    date: new Date().toISOString(),
  };
  localStorage.setItem('hikeCertName', name);
  localStorage.setItem('hikeCert', JSON.stringify(record));
  return record;
}

function formatDate(iso) {
  const d = iso ? new Date(iso) : new Date();
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/* Deterministic certificate number: date + short hash of name|date. */
function certIdFor(record) {
  let h = 0;
  for (const ch of `${record.name}|${record.date}`) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const d = new Date(record.date);
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `HIKE-${ymd}-${h.toString(16).toUpperCase().padStart(6, '0').slice(-6)}`;
}

function honorFor(pct) {
  if (pct >= 90) return 'With Distinction';
  if (pct >= 80) return 'With Merit';
  if (pct >= 60) return 'Completed';
  return 'Participation';
}

const WATERMARK_TEXT = 'Hike Medical · The Insole Book · ';

/* Confetti + emoji burst over the whole screen when the certificate lands. */
function celebrate(pct) {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  document.getElementById('celebrateCanvas')?.remove();
  const cv = document.createElement('canvas');
  cv.id = 'celebrateCanvas';
  document.body.appendChild(cv);
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const W = window.innerWidth;
  const H = window.innerHeight;
  cv.width = W * dpr;
  cv.height = H * dpr;
  const ctx = cv.getContext('2d');
  ctx.scale(dpr, dpr);

  const colors = ['#0a6cff', '#c9a227', '#16a34a', '#e8960c', '#ff4d6d', '#7c3aed', '#ffffff'];
  const emojis = pct >= 80
    ? ['🦶', '🎉', '🏆', '✨', '🎓', '👟', '💙', '⭐', '🥇']
    : ['🦶', '🎉', '✨', '👟', '💙', '🎓'];
  const pick = arr => arr[(Math.random() * arr.length) | 0];
  const P = [];
  const emojiFont = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

  function burst(x, y, n, spread, power) {
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * spread;
      const s = power * (0.55 + Math.random() * 0.75);
      const isEmoji = Math.random() < 0.26;
      P.push({
        x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        g: 0.22 + Math.random() * 0.1, drag: 0.985,
        r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
        w: 6 + Math.random() * 8, h: 8 + Math.random() * 10,
        c: colors[i % colors.length],
        e: isEmoji ? pick(emojis) : null, size: 22 + Math.random() * 22,
        life: 1, decay: 0.004 + Math.random() * 0.005,
      });
    }
  }
  burst(W * 0.5, H * 0.62, 150, 1.7, 16);
  setTimeout(() => burst(W * 0.14, H * 0.72, 80, 1.3, 15), 260);
  setTimeout(() => burst(W * 0.86, H * 0.72, 80, 1.3, 15), 480);

  // gentle emoji rain from the top for a couple of seconds
  const rain = setInterval(() => {
    for (let i = 0; i < 3; i++) {
      P.push({
        x: Math.random() * W, y: -40, vx: (Math.random() - 0.5) * 1.2, vy: 1.6 + Math.random() * 2.2,
        g: 0.012, drag: 1, r: 0, vr: (Math.random() - 0.5) * 0.08,
        e: pick(emojis), size: 24 + Math.random() * 22, life: 1, decay: 0.0026,
      });
    }
  }, 110);
  setTimeout(() => clearInterval(rain), 2800);

  const t0 = performance.now();
  function frame(t) {
    ctx.clearRect(0, 0, W, H);
    let alive = false;
    for (const p of P) {
      if (p.life <= 0) continue;
      p.vy += p.g; p.vx *= p.drag; p.vy *= p.drag;
      p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life -= p.decay;
      if (p.y > H + 60) { p.life = 0; continue; }
      alive = true;
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.4));
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      if (p.e) {
        ctx.font = `${p.size}px ${emojiFont}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.e, 0, 0);
      } else {
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();
    }
    if (alive && t - t0 < 7000) requestAnimationFrame(frame);
    else cv.remove();
  }
  requestAnimationFrame(frame);
}

function setPanel(name) {
  $('quizIntro').hidden = name !== 'intro';
  $('quizCard').hidden = name !== 'ask';
  $('scoreCard').hidden = name !== 'score';
  $('certWrap').hidden = name !== 'cert';
}

function renderQuestion() {
  const q = QUIZ[currentIndex()];
  const n = Object.keys(quizState.answers).length + 1;
  $('quizFill').style.width = `${((n - 1) / TOTAL) * 100}%`;
  $('quizProgressLabel').textContent = `Question ${n} of ${TOTAL}`;
  $('qNumber').textContent = `Question ${n}`;
  $('qText').textContent = q.q;
  const box = $('options');
  box.innerHTML = '';
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option';
    btn.innerHTML = `<span class="option-letter">${LETTERS[i]}</span><span>${opt}</span>`;
    btn.addEventListener('click', () => select(i));
    box.appendChild(btn);
  });
  const exp = $('explanation');
  exp.hidden = true;
  exp.className = 'explanation';
  $('quizNext').hidden = true;
  quizState.answered = false;
  $('quizCard')?.classList.remove('pop');
  void $('quizCard')?.offsetWidth;
  $('quizCard')?.classList.add('pop');
}

function select(idx) {
  if (quizState.answered) return;
  quizState.answered = true;
  const qi = currentIndex();
  const q = QUIZ[qi];
  const opts = [...document.querySelectorAll('#options .option')];
  opts.forEach(o => { o.classList.add('disabled'); o.disabled = true; });
  const exp = $('explanation');
  const ok = idx === q.answer;
  quizState.answers[String(qi)] = ok;
  persistProgress();
  if (ok) {
    opts[idx].classList.add('correct');
    exp.className = 'explanation correct-exp';
    $('verdict').textContent = q.correct;
  } else {
    opts[idx].classList.add('wrong');
    opts[q.answer].classList.add('correct');
    exp.className = 'explanation wrong-exp';
    $('verdict').textContent = q.wrong;
  }
  $('expText').textContent = q.explanation;
  exp.hidden = false;
  $('quizNext').hidden = false;
  const last = quizState.cursor >= quizState.queue.length - 1;
  if (quizState.mode === 'check') {
    $('quizNext').textContent = last ? 'Next lesson →' : 'Next question →';
  } else {
    $('quizNext').textContent = last ? 'See my score →' : 'Next question →';
  }
}

function finishCheckpoint() {
  const done = quizState.onCheckDone;
  quizState.mode = null;
  quizState.queue = [];
  quizState.cursor = 0;
  quizState.answered = false;
  quizState.onCheckDone = null;
  setCheckChrome(false);
  done?.();
}

function startFinalQueue(all = false) {
  quizState.mode = 'final';
  quizState.queue = all ? QUIZ.map((_, i) => i) : unanswered();
  quizState.cursor = 0;
  quizState.answered = false;
  quizState.done = false;
  setCheckChrome(false);
  if (!quizState.queue.length) {
    showScore();
    return;
  }
  setPanel('ask');
  renderQuestion();
}

function showScore() {
  quizState.done = true;
  persistProgress();
  setPanel('score');
  const score = liveScore();
  const pct = Math.round((score / TOTAL) * 100);
  $('scoreNumber').textContent = score;
  const circle = $('scoreCircle');
  circle.className = 'score-circle ' + (pct >= 80 ? 'great' : pct >= 60 ? 'ok' : 'low');
  if (pct >= 80) {
    $('scoreTitle').textContent = 'Excellent work.';
    $('scoreSub').textContent = `You scored ${score} of ${TOTAL} (${pct}%). You can read a Hike insole — products, accommodations, and the floor.`;
  } else if (pct >= 60) {
    $('scoreTitle').textContent = 'Good effort.';
    $('scoreSub').textContent = `You scored ${score} of ${TOTAL} (${pct}%). Review the sections that tripped you, then retake if you want a stronger mark on the certificate.`;
  } else {
    $('scoreTitle').textContent = 'Keep studying.';
    $('scoreSub').textContent = `You scored ${score} of ${TOTAL} (${pct}%). Go back through the chapters and try again — the certificate waits for you.`;
  }
  $('quizFill').style.width = '100%';
  $('quizProgressLabel').textContent = 'Quiz complete';
  $('scoreOf').textContent = `out of ${TOTAL}`;
  $('certName').value = quizState.name;
  $('certName').focus();
}

function fillCertificate(record) {
  $('certPerson').textContent = record.name;
  $('certSignee').textContent = record.name;
  $('certScore').textContent = `${record.score} / ${record.total}`;
  $('certPct').textContent = `${record.pct}%`;
  $('certDate').textContent = formatDate(record.date);
  $('certHonor').textContent = honorFor(record.pct);
  $('certId').textContent = certIdFor(record);
  $('certWm').textContent = WATERMARK_TEXT.repeat(140);
}

function showCertificate(record, { party = true } = {}) {
  fillCertificate(record);
  setPanel('cert');
  document.body.classList.add('cert-ready');
  $('quiz').classList.add('cert-wide');
  $('quiz').scrollTo?.({ top: 0, behavior: 'smooth' });
  if (party) setTimeout(() => celebrate(record.pct), 250);
}

function claimCertificate() {
  const name = $('certName').value.trim();
  if (!name) {
    $('certName').focus();
    $('certName').classList.add('need');
    return;
  }
  $('certName').classList.remove('need');
  quizState.name = name;
  const record = persistCert(name, liveScore());
  showCertificate(record);
}

function restartQuiz() {
  quizState.answers = {};
  quizState.done = false;
  persistProgress();
  document.body.classList.remove('cert-ready');
  $('quiz').classList.remove('cert-wide');
  document.getElementById('celebrateCanvas')?.remove();
  startFinalQueue(true);
}

function loadLogo() {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = './assets/hike-logo.jpg';
  });
}

async function downloadCertificate() {
  const record = JSON.parse(localStorage.getItem('hikeCert') || 'null');
  if (!record) return;
  const w = 1800;
  const h = 1272;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  const SANS = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif';
  const SERIF = '"New York", "Iowan Old Style", Georgia, serif';
  const SCRIPT = '"Snell Roundhand", "Apple Chancery", "Brush Script MT", "Segoe Script", cursive';
  const GOLD = '#c9a227', GOLD_INK = '#8a6d1c', INK = '#16181d', INK2 = '#4c5160', INK3 = '#8a8f9c', BLUE = '#0a4dbf';
  const cx = w / 2;

  // gold foil band + parchment
  const foil = ctx.createLinearGradient(0, 0, w, h);
  foil.addColorStop(0, '#d9b756'); foil.addColorStop(0.2, '#f6e7a8'); foil.addColorStop(0.48, GOLD);
  foil.addColorStop(0.76, '#f1dc93'); foil.addColorStop(1, '#a67c1a');
  ctx.fillStyle = foil;
  ctx.fillRect(0, 0, w, h);
  const pad = 28;
  ctx.fillStyle = '#fdfbf4';
  ctx.fillRect(pad, pad, w - pad * 2, h - pad * 2);
  ctx.strokeStyle = GOLD; ctx.lineWidth = 2.5;
  ctx.strokeRect(pad + 1, pad + 1, w - pad * 2 - 2, h - pad * 2 - 2);
  ctx.strokeStyle = 'rgba(201,162,39,.6)'; ctx.lineWidth = 1.2;
  ctx.strokeRect(pad + 16, pad + 16, w - pad * 2 - 32, h - pad * 2 - 32);

  // guilloche: faint rings + diagonal hatch
  ctx.save();
  ctx.beginPath(); ctx.rect(pad + 18, pad + 18, w - pad * 2 - 36, h - pad * 2 - 36); ctx.clip();
  ctx.strokeStyle = 'rgba(201,162,39,.09)'; ctx.lineWidth = 1;
  for (let r = 14; r < w; r += 14) { ctx.beginPath(); ctx.arc(cx, h * 0.54, r, 0, Math.PI * 2); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(10,108,255,.04)';
  for (let x = -h; x < w + h; x += 22) { ctx.beginPath(); ctx.moveTo(x, h); ctx.lineTo(x + h * 0.62, 0); ctx.stroke(); }
  // diagonal wordmark watermark
  ctx.save();
  ctx.translate(cx, h / 2); ctx.rotate(-Math.PI / 6);
  ctx.fillStyle = 'rgba(10,108,255,.055)';
  ctx.font = `800 15px ${SANS}`; ctx.textAlign = 'center';
  const wm = (WATERMARK_TEXT.toUpperCase().split('').join('\u200A')).repeat(4);
  for (let y = -h; y < h; y += 46) ctx.fillText(wm, 0, y);
  ctx.restore();
  ctx.restore();

  const logo = await loadLogo();
  if (logo) {
    // big faded logo watermark
    ctx.save();
    ctx.globalAlpha = 0.06; ctx.filter = 'grayscale(1)';
    ctx.translate(cx, h * 0.55); ctx.rotate(-Math.PI / 15);
    const ww = w * 0.6, wh = ww * (logo.height / logo.width);
    ctx.drawImage(logo, -ww / 2, -wh / 2, ww, wh);
    ctx.restore();
  }

  // corner flourishes
  const corner = (x, y, rot) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.strokeStyle = GOLD; ctx.lineWidth = 3.5; ctx.lineCap = 'square';
    ctx.beginPath(); ctx.moveTo(0, 84); ctx.lineTo(0, 0); ctx.lineTo(84, 0); ctx.stroke();
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(11, 56); ctx.lineTo(11, 44); ctx.arc(44, 44, 33, Math.PI, Math.PI * 1.5); ctx.lineTo(56, 11); ctx.stroke();
    ctx.fillStyle = GOLD; ctx.font = `20px ${SANS}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fdfbf4'; ctx.fillRect(-12, -12, 24, 24);
    ctx.fillStyle = GOLD; ctx.fillText('✦', 0, 1);
    ctx.restore();
  };
  const c0 = pad + 24;
  corner(c0, c0, 0); corner(w - c0, c0, Math.PI / 2); corner(w - c0, h - c0, Math.PI); corner(c0, h - c0, -Math.PI / 2);

  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  if (logo) {
    const lw = 220, lh = lw * (logo.height / logo.width);
    ctx.drawImage(logo, cx - lw / 2, 96, lw, lh);
  }
  ctx.fillStyle = GOLD_INK; ctx.font = `800 15px ${SANS}`;
  ctx.fillText('H I K E   M E D I C A L   ·   T H E   I N S O L E   B O O K', cx, 200);

  ctx.fillStyle = INK; ctx.font = `600 66px ${SERIF}`;
  ctx.fillText('Certificate of Completion', cx, 286);
  ctx.fillStyle = GOLD_INK; ctx.font = `italic 400 24px ${SERIF}`;
  ctx.fillText('Custom Orthotic Training', cx, 326);
  const rule = (x1, x2, y, flip) => {
    const g = ctx.createLinearGradient(x1, 0, x2, 0);
    g.addColorStop(flip ? 1 : 0, 'rgba(201,162,39,0)'); g.addColorStop(flip ? 0 : 1, GOLD);
    ctx.strokeStyle = g; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
  };
  rule(cx - 300, cx - 160, 318, false); rule(cx + 160, cx + 300, 318, true);

  ctx.fillStyle = INK3; ctx.font = `600 16px ${SANS}`;
  ctx.fillText('T H I S   I S   T O   C E R T I F Y   T H A T', cx, 392);

  ctx.fillStyle = BLUE; ctx.font = `500 88px ${SCRIPT}`;
  ctx.fillText(record.name, cx, 488);
  const nw = Math.max(520, ctx.measureText(record.name).width + 80);
  ctx.strokeStyle = GOLD; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(cx - nw / 2, 512); ctx.lineTo(cx + nw / 2, 512); ctx.stroke();

  ctx.fillStyle = INK2; ctx.font = `400 22px ${SANS}`;
  wrapText(ctx,
    'has successfully completed Custom Orthotic Training — bases, mid-layers and top covers, accommodations, production flow, and the four verbs — and can read a Hike insole on sight.',
    cx, 566, 1080, 34);

  // stats row + seal
  const rowY = 760;
  ctx.fillStyle = INK; ctx.font = `600 36px ${SERIF}`;
  ctx.fillText(`${record.score} / ${record.total}`, cx - 330, rowY);
  ctx.fillText(formatDate(record.date), cx + 330, rowY);
  ctx.fillStyle = INK3; ctx.font = `700 13px ${SANS}`;
  ctx.fillText('F I N A L   S C O R E', cx - 330, rowY + 28);
  ctx.fillText('D A T E   A W A R D E D', cx + 330, rowY + 28);

  const sy = rowY - 18, R = 84;
  // ribbons
  const ribbon = (dx, rot) => {
    ctx.save(); ctx.translate(cx + dx, sy + R * 0.45); ctx.rotate(rot);
    const g = ctx.createLinearGradient(0, 0, 0, 90); g.addColorStop(0, '#1c7bff'); g.addColorStop(1, '#0648b0');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(-17, 0); ctx.lineTo(17, 0); ctx.lineTo(17, 92); ctx.lineTo(0, 76); ctx.lineTo(-17, 92); ctx.closePath(); ctx.fill();
    ctx.restore();
  };
  ribbon(-24, 0.28); ribbon(24, -0.28);
  // serrated gold seal
  ctx.save();
  ctx.shadowColor = 'rgba(160,120,20,.35)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10;
  for (let i = 0; i < 48; i++) {
    ctx.fillStyle = i % 2 ? '#a67c1a' : '#e6c65a';
    ctx.beginPath(); ctx.moveTo(cx, sy);
    ctx.arc(cx, sy, R, (i / 48) * Math.PI * 2, ((i + 1) / 48) * Math.PI * 2); ctx.closePath(); ctx.fill();
    ctx.shadowColor = 'transparent';
  }
  ctx.restore();
  const sg = ctx.createRadialGradient(cx - R * 0.3, sy - R * 0.35, 4, cx, sy, R - 14);
  sg.addColorStop(0, '#fff5cc'); sg.addColorStop(0.55, '#d4af37'); sg.addColorStop(1, '#a67c1a');
  ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(cx, sy, R - 14, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(cx, sy, R - 16, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = 'rgba(140,100,20,.3)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx, sy, R - 24, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#3d2c05'; ctx.textBaseline = 'middle';
  ctx.font = `18px "Apple Color Emoji","Segoe UI Emoji",sans-serif`; ctx.fillText('🦶', cx, sy - 30);
  ctx.font = `800 38px ${SANS}`; ctx.fillText(`${record.pct}%`, cx, sy + 2);
  ctx.font = `800 11px ${SANS}`; ctx.fillText('H I K E   C E R T I F I E D', cx, sy + 34);
  ctx.textBaseline = 'alphabetic';

  // honors pill
  const honor = honorFor(record.pct).toUpperCase().split('').join(' ');
  ctx.font = `800 14px ${SANS}`;
  const hw = ctx.measureText(honor).width + 56, hy = 900;
  ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.strokeStyle = GOLD; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.roundRect(cx - hw / 2, hy - 22, hw, 40, 20); ctx.fill(); ctx.stroke();
  ctx.fillStyle = GOLD_INK; ctx.fillText(honor, cx, hy + 3);

  // footer: signature lines + certificate number
  const fy = 1080;
  const signLine = (x, label, script) => {
    if (script) { ctx.fillStyle = BLUE; ctx.font = `500 34px ${SCRIPT}`; ctx.fillText(script, x, fy - 14); }
    ctx.strokeStyle = GOLD; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x - 170, fy); ctx.lineTo(x + 170, fy); ctx.stroke();
    ctx.fillStyle = INK3; ctx.font = `800 13px ${SANS}`; ctx.fillText(label, x, fy + 26);
  };
  signLine(cx - 470, 'T R A I N I N G   L E A D', null);
  signLine(cx + 470, 'T R A I N E E', record.name);
  ctx.fillStyle = INK3; ctx.font = `700 12px ${SANS}`; ctx.fillText('C E R T I F I C A T E   №', cx, fy - 4);
  ctx.fillStyle = INK; ctx.font = `600 18px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.fillText(certIdFor(record), cx, fy + 24);

  const a = document.createElement('a');
  const slug = record.name.replace(/[^\w]+/g, '-').replace(/^-|-$/g, '');
  a.download = `Hike-Insole-Book-Certificate-${slug}.png`;
  a.href = canvas.toDataURL('image/png');
  a.click();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let yy = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth) {
      ctx.fillText(line, x, yy);
      line = word;
      yy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, yy);
}

export function initQuiz({ onBack } = {}) {
  $('quizStart').addEventListener('click', () => {
    if (quizState.done) restartQuiz();
    else startFinalQueue(false);
  });
  $('quizNext').addEventListener('click', () => {
    if (quizState.cursor < quizState.queue.length - 1) {
      quizState.cursor++;
      renderQuestion();
      return;
    }
    if (quizState.mode === 'check') finishCheckpoint();
    else showScore();
  });
  $('quizRestart').addEventListener('click', restartQuiz);
  $('certRestart').addEventListener('click', restartQuiz);
  $('claimCert').addEventListener('click', claimCertificate);
  $('printCert').addEventListener('click', () => window.print());
  $('downloadCert').addEventListener('click', () => { downloadCertificate(); });
  $('certName').addEventListener('input', () => $('certName').classList.remove('need'));
  $('certName').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); claimCertificate(); }
  });
  document.querySelectorAll('[data-quiz-back]').forEach(btn => {
    btn.addEventListener('click', () => onBack?.());
  });
}

export function openQuiz() {
  if (quizState.mode === 'check' && quizState.queue.length) {
    setCheckChrome(true);
    setPanel('ask');
    renderQuestion();
    return;
  }
  const saved = localStorage.getItem('hikeCert');
  if (quizState.done && saved) {
    setCheckChrome(false);
    showCertificate(JSON.parse(saved), { party: false });
    return;
  }
  if (quizState.done) {
    setCheckChrome(false);
    setPanel('score');
    return;
  }
  if (quizState.mode === 'final' && quizState.queue.length) {
    setCheckChrome(false);
    setPanel('ask');
    renderQuestion();
    return;
  }
  setCheckChrome(false);
  setPanel('intro');
  const doneN = Object.keys(quizState.answers).length;
  $('quizFill').style.width = `${(doneN / TOTAL) * 100}%`;
  $('quizProgressLabel').textContent = `${TOTAL} questions`;
}

export function quizBlocksKeys() {
  return !document.getElementById('quiz')?.hidden;
}

export function quizIsCheck() {
  return quizState.mode === 'check';
}

/* console helper for training checks — finishes the exam and shows the cert */
window.__quizFinish = (name = 'Alex Rivera', score = 46) => {
  quizState.answers = {};
  for (let i = 0; i < TOTAL; i++) quizState.answers[String(i)] = i < score;
  quizState.done = true;
  quizState.name = name;
  persistProgress();
  persistCert(name, liveScore());
  showCertificate(JSON.parse(localStorage.getItem('hikeCert')));
};
