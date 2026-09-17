/* The floor exam — 50 questions, then a named certificate. */

export const QUIZ = [
  { q: "What is the primary structural component of every Hike insole?", difficulty: "easy", options: ["The top cover","The 3D-printed shell","The cork base","The wedge slab"], answer: 1, correct: "Correct!", wrong: "Not quite.", explanation: "The shell is the 3D-printed base — the structural foundation of every insole. The top cover is glued on top of it." },
  { q: "What is Hike Medical's SLA for shipping a finished insole out of the facility?", difficulty: "easy", options: ["3 business days","7 business days","5 business days","10 business days"], answer: 2, correct: "That's right!", wrong: "Not quite — it's 5 business days.", explanation: "Hike ships every finished insole out of the facility within 5 business days of receiving the order." },
  { q: "What are the two primary orthotic types Hike produces?", difficulty: "easy", options: ["Sport and Everyday","Functional and Diabetic","Shell and UCBL","Clinical and Consumer"], answer: 1, correct: "Correct!", wrong: "Not quite — those are order types or shell types, not orthotic types.", explanation: "Hike produces Functional orthotics focused on biomechanical correction, and Diabetic orthotics engineered for pressure offloading and skin protection." },
  { q: "Which top cover T-code is the thinnest available?", difficulty: "easy", options: ["T8","T11","T5","T13"], answer: 2, correct: "Correct!", wrong: "Not quite — T5 Vinyl at 1.0 mm is the thinnest.", explanation: "T5 is Vinyl at 1.0 mm — the thinnest top cover in the library. Used only when the shoe has no room for a thicker cover." },
  { q: "What is the default top cover for a Hike UCBL?", difficulty: "easy", options: ["T1 — 1/8\" P-Cell","T6 — Spenco","T4 — Preferred Puff over Poron","T7 — 1/8\" Puff"], answer: 3, correct: "That's right!", wrong: "Not quite — the UCBL default is T7, 1/8\" Puff.", explanation: "The standard default top cover for the Hike UCBL is T7 — a single layer of 1/8\" Puff foam." },
  { q: "Which diabetic shell is paired with the T2 top cover?", difficulty: "easy", options: ["Hike Diabetic 35 — Sweet","Hike Diabetic 55 — Triple Sweet","Hike Diabetic 45 — Double Sweet","Hike Flexible Shell"], answer: 2, correct: "Correct!", wrong: "Not quite — T2 pairs with the Double Sweet (Diabetic 45).", explanation: "The Double Sweet (Diabetic 45) is paired with T2 — a two-layer cover of 1/16\" P-Cell over 1/16\" Poron." },
  { q: "What is the difference between a Clinical order and a Consumer order?", difficulty: "medium", options: ["Clinical orders are faster to produce","Consumer orders involve a clinician specifying all accommodations","Clinical orders are submitted by a licensed clinician with full specifications; consumer orders have no clinician involvement","There is no difference — both follow the same workflow"], answer: 2, correct: "Exactly right!", wrong: "Not quite — the key difference is clinician involvement and specification detail.", explanation: "Clinical orders are submitted by licensed clinicians with full Rx specifications. Consumer orders have no clinician — the design team determines arch sizing from the scan." },
  { q: "What does UCBL stand for?", difficulty: "easy", options: ["Universal Corrective Base Layer","University of California Biomechanics Laboratory","Upper Calcaneal Bearing Liner","Unified Cushion Base Liner"], answer: 1, correct: "That's right!", wrong: "Not quite — it stands for University of California Biomechanics Laboratory.", explanation: "UCBL stands for University of California Biomechanics Laboratory — where the high-wall rearfoot control shell design originated." },
  { q: "What material is the Hike Corkbase shell made from?", difficulty: "easy", options: ["TPU with a cork top layer","Cork composite as the shell itself","Nylon with cork infill","Standard TPU with cork coating"], answer: 1, correct: "Correct!", wrong: "Not quite — the shell itself is cork, not a TPU print with a cork layer.", explanation: "The Corkbase shell is made from cork as the actual base material — not a TPU print with a cork layer on top." },
  { q: "What is the correct order of production steps after a clinical order is designed?", difficulty: "medium", options: ["Print → Glue → QC → Finish → Ship","Print → Glue → Finish → QC → Ship","Glue → Print → Finish → QC → Ship","Print → Finish → Glue → QC → Ship"], answer: 1, correct: "Perfect!", wrong: "Not quite — finishing happens before QC, not after gluing directly.", explanation: "The correct production flow is: Design → Print → Glue top cover → Finish edges → QC → Ship. Nothing leaves without QC sign-off." },
  { q: "What does a Medial Wedge correct?", difficulty: "easy", options: ["Supination — the heel rolling outward","Overpronation — the heel rolling inward","Leg length discrepancy","Forefoot varus"], answer: 1, correct: "Correct!", wrong: "Not quite — medial raises the inner border to correct overpronation.", explanation: "A Medial Wedge raises the inner border to stop the heel rolling inward — the correction for valgus and overpronation." },
  { q: "What is the key build rule for a Morton's Extension that must never be violated?", difficulty: "hard", options: ["The extension must always taper thin toward the tip","The shell edge must stay full thickness all the way to the tip — no taper","The extension must cover all five rays","The extension must be glued separately after printing"], answer: 1, correct: "Exactly right — this is critical!", wrong: "Not quite — thinning the edge defeats the entire accommodation.", explanation: "The shell edge under a Morton's Extension must stay full thickness to the tip. If thinned or tapered, the rigid lever arm disappears and the whole accommodation stops working." },
  { q: "What is the T3 top cover recipe?", difficulty: "medium", options: ["1/8\" P-Cell only","1/16\" P-Cell over 1/16\" Poron","1/8\" P-Cell over 1/16\" Poron","1/8\" Poron only"], answer: 2, correct: "Correct!", wrong: "Not quite — T3 is 1/8\" P-Cell over 1/16\" Poron, the thickest diabetic cover.", explanation: "T3 is 1/8\" P-Cell over 1/16\" Poron — the thickest diabetic cover at approximately 4.8 mm, paired with the Triple Sweet (Diabetic 55) shell." },
  { q: "What does a U-shaped heel post do that makes it different from an Oval post?", difficulty: "medium", options: ["It raises both medial and lateral borders simultaneously","It leaves the center of the heel unloaded so a painful structure floats free","It provides the most aggressive rearfoot control","It is only used on diabetic devices"], answer: 1, correct: "That's right!", wrong: "Not quite — the defining feature of the U post is the open center that floats the heel.", explanation: "The U post cradles the heel on both sides while leaving the center unloaded — used when the patient has central heel pain, a spur, or a sensitive structure that cannot bear direct pressure." },
  { q: "Hike Sport and Hike Everyday are:", difficulty: "easy", options: ["The same shell — the name is only a label","Both co-poly function, but Sport carries more support than Everyday","Different materials — Sport is cork, Everyday is EVA","Sport is diabetic; Everyday is functional"], answer: 1, correct: "Correct!", wrong: "Not quite — both are co-poly function, but they are not identical. Sport is the higher-support version.", explanation: "Sport and Everyday are both co-poly function. Sport carries more support for active patients. Everyday is the flexible version for everyday wear, comfort with support, and first-time users." },
  { q: "Which reinforcement pattern is mutually exclusive with all other reinforcement patterns?", difficulty: "medium", options: ["Radial Fan","Isogrid","Ribbed","Arch Ribs"], answer: 2, correct: "That's right!", wrong: "Not quite — Ribbed is the one that removes all other patterns when enabled.", explanation: "Enabling Ribbed reinforcement removes the other three patterns. It is mutually exclusive with Radial Fan, Isogrid, and Arch Ribs." },
  { q: "What is the verb for every heel post?", difficulty: "easy", options: ["RELIEVE","SOFTEN","RAISE","STIFFEN"], answer: 2, correct: "Correct!", wrong: "Not quite — heel posts are always a RAISE.", explanation: "Every heel post is a RAISE — you are adding material under the heel to change its angle or height." },
  { q: "What is the difference between an extrinsic and intrinsic wedge?", difficulty: "medium", options: ["Extrinsic is medial; intrinsic is lateral","Extrinsic is a separate printed part under the shell; intrinsic is built into the shell geometry","Extrinsic is cork; intrinsic is printed TPU","There is no difference"], answer: 1, correct: "Exactly right!", wrong: "Not quite — the distinction is where the tilt lives: outside the shell or inside it.", explanation: "Extrinsic wedge = a separate printed TPU slab under a flat-bottomed shell. Intrinsic = correction baked directly into the shell geometry during design. Same clinical goal, different build method." },
  { q: "What is P-Cell foam primarily used for?", difficulty: "easy", options: ["Athletic spring and energy return","Pure shock absorption on functional shells","Cushioning and friction reduction for high-risk diabetic skin","Structural stiffening of the shell"], answer: 2, correct: "Correct!", wrong: "Not quite — P-Cell is for diabetic skin protection and friction reduction.", explanation: "P-Cell is the soft foam the foot touches on diabetic builds — designed for cushioning and friction reduction for high-risk skin. Used on T1, T2, T3, and T11." },
  { q: "A Morton's Extension is mutually exclusive with which other accommodation?", difficulty: "medium", options: ["Gait Plate","Heel Post","Reverse Morton's Extension","Met Pad"], answer: 2, correct: "That's right!", wrong: "Not quite — both reshape the same front edge in opposite directions.", explanation: "Morton's Extension and Reverse Morton's Extension are mutually exclusive — both reshape the same distal trimline in opposite directions and cannot coexist on the same shell." },
  { q: "Which top cover is the default for the Hike Flexible Shell?", difficulty: "medium", options: ["T7 — 1/8\" Puff","T1 — 1/8\" P-Cell","T6 — 1/8\" Spenco","T4 — Preferred Puff over Poron"], answer: 2, correct: "Correct!", wrong: "Not quite — the Flexible Shell pairs with T6 Spenco by default.", explanation: "The Hike Flexible Shell's default top cover is T6 — a 1/8\" Spenco layer that adds athletic spring on top of the adaptive flexible base." },
  { q: "What does the Radial Fan reinforcement pattern follow?", difficulty: "hard", options: ["The metatarsal parabola across the forefoot","The plantar fascia's own load path from the calcaneal tubercle","The navicular line from heel to first met","Parallel lines across the full plate"], answer: 1, correct: "Exactly right!", wrong: "Not quite — the rays follow the plantar fascia load path from the calcaneal tubercle.", explanation: "The Radial Fan spreads from the calcaneal tubercle in a full 360° pattern, following the plantar fascia's own load paths — the most anatomically intelligent reinforcement in the library." },
  { q: "What is the key distinction between a Met Pad and a Met Bar?", difficulty: "medium", options: ["Met Pad is for diabetic orders only; Met Bar is for functional","Met Pad is a softer symmetric dome; Met Bar is a precise structural ridge with a fixed silhouette","Met Pad sits under the met heads; Met Bar sits behind them","They are interchangeable — same clinical result"], answer: 1, correct: "Correct!", wrong: "Not quite — both sit behind the heads, but their structure and clinical use differ.", explanation: "The Met Pad is a softer, more accommodative symmetric dome. The Met Bar is a precise, structured ridge with a fixed digitized silhouette. Both sit proximal to the met heads and are mutually exclusive." },
  { q: "What does the Tarsal Tunnel Groove modify on the insole?", difficulty: "hard", options: ["The plantar surface under the arch","The medial heel cup wall","The heel seat surface","The forefoot trimline"], answer: 1, correct: "That's right!", wrong: "Not quite — it modifies the medial wall of the heel cup, not the plantar surface.", explanation: "The Tarsal Tunnel Groove is scooped from the medial heel cup wall — not the plantar surface. The insole body is untouched. Only the wall is modified to relieve pressure on the tarsal tunnel." },
  { q: "Which of the four production verbs applies to a Drill and Fill?", difficulty: "medium", options: ["RAISE","RELIEVE","STIFFEN","SOFTEN"], answer: 3, correct: "Correct!", wrong: "Not quite — Drill and Fill softens the contact zone, it does not remove it.", explanation: "Drill and Fill is SOFTEN — it replaces hard shell contact with soft material (P-Cell or Poron) at a met head zone, cushioning rather than removing contact entirely." },
  { q: "How many Arch Ribs does SoleGen place under the arch by default?", difficulty: "medium", options: ["2","6","4","8"], answer: 2, correct: "Correct!", wrong: "Not quite — four ribs is the default.", explanation: "Arch Ribs default to four longitudinal ribs laid along the navicular line — from the medial heel cup to MT1 — the direction the arch actually spans." },
  { q: "In a Gait Plate for an in-toeing patient, which side gets the extension?", difficulty: "medium", options: ["Medial side","Lateral side","Both sides equally","Neither — the front edge is cut back on both sides"], answer: 1, correct: "That's right!", wrong: "Not quite — in-toeing always gets the lateral extension.", explanation: "In-toeing gets the extension on the lateral side, so the foot rolls outward during push-off. Out-toeing gets the medial extension." },
  { q: "What is the thickness of a T3 top cover?", difficulty: "easy", options: ["3.2 mm","1.6 mm","1.0 mm","4.8 mm"], answer: 3, correct: "Correct!", wrong: "Not quite — T3 is approximately 4.8 mm, the thickest in the Sweet family.", explanation: "T3 is the thickest diabetic cover at approximately 4.8 mm — a full 1/8\" P-Cell layer over a 1/16\" Poron layer." },
  { q: "What does the Heel Fill do differently from the Heel Pad?", difficulty: "hard", options: ["Heel Fill cuts a soft insert into the shell; Heel Pad builds the seat surface up","Heel Fill builds the seat surface up; Heel Pad cuts a soft insert into the thickness","They are the same accommodation with different names","Heel Fill is only for diabetic devices; Heel Pad is for functional"], answer: 1, correct: "Exactly right!", wrong: "Not quite — Fill raises the surface; Pad softens the material within the thickness.", explanation: "Heel Fill builds the heel seat upward — RAISE. Heel Pad cuts a soft insert into the shell thickness — SOFTEN. Same heel zone, opposite approach." },
  { q: "Which scan method is the most commonly used to initiate a Hike order?", difficulty: "easy", options: ["Scan Impression Box","Structure Sensor Foot Scan","Ship Impression Box","Hike Scan"], answer: 3, correct: "Correct!", wrong: "Not quite — Hike Scan is the dominant method across all order types.", explanation: "Hike Scan is by far the most commonly used casting method — accounting for the large majority of orders across both diabetic and functional orthotic types." },
  { q: "A Reverse Dancer's Pad offloads which metatarsal head?", difficulty: "medium", options: ["MT1 — first metatarsal head","MT3 — third metatarsal head","MT5 — fifth metatarsal head","MT2 and MT3 combined"], answer: 2, correct: "Correct!", wrong: "Not quite — the Reverse Dancer's offloads MT5 on the lateral side.", explanation: "The Reverse Dancer's Pad offloads MT5 — the fifth metatarsal head on the lateral forefoot. The standard Dancer's Pad offloads MT1." },
  { q: "What is the default angle for both printed medial and lateral wedges?", difficulty: "medium", options: ["2°","6°","4°","8°"], answer: 2, correct: "That's right!", wrong: "Not quite — default is 4° for both wedge types.", explanation: "The default angle for both the printed Medial and Lateral Wedge is 4°. At 0° no part is generated at all." },
  { q: "How is an extrinsic wedge built on a printed Hike insole?", difficulty: "hard", options: ["A cork blank is glued by hand under a flat shell","A separate TPU slab is printed and sits under a flat-bottomed shell","The tilt is ground into the shell after printing","The top cover is stacked thicker on one border"], answer: 1, correct: "Correct!", wrong: "Not quite — extrinsic wedges are printed TPU slabs, not hand-glued cork.", explanation: "An extrinsic wedge is a separate printed TPU slab. The shell prints flat and untilted; the angle lives in the slab underneath. Hike no longer glues cork wedges." },
  { q: "What does a Neuroma Pad treat and where is it positioned?", difficulty: "medium", options: ["Heel pain — centered under the calcaneus","Arch collapse — centered under the navicular","A pinched nerve between met heads — just proximal and slightly medial to the affected webspace","Met head pressure — directly under the metatarsal heads"], answer: 2, correct: "Exactly right!", wrong: "Not quite — it targets the intermetatarsal nerve, positioned just proximal to the webspace.", explanation: "A Neuroma Pad treats a Morton's neuroma — a pinched nerve between met heads, classically the 3rd webspace. It sits just proximal and slightly medial to that space to gently spread the heads apart." },
  { q: "What is the Isogrid reinforcement pattern based on?", difficulty: "hard", options: ["Parallel transverse corrugation","Radial spokes from a central point","Three rib families 60° apart forming equilateral triangles","Four longitudinal ribs along the navicular line"], answer: 2, correct: "Correct!", wrong: "Not quite — three rib families at 60° forming triangles is the Isogrid pattern.", explanation: "Isogrid uses three rib families oriented 60° apart, forming equilateral triangles — the aerospace standard for thin plates. It is quasi-isotropic, carrying torsion in all directions equally." },
  { q: "What happens at the finishing wheel in production?", difficulty: "easy", options: ["The top cover is glued to the shell","The shell is 3D printed","The edges of the insole are ground smooth","QC inspection is performed"], answer: 2, correct: "That's right!", wrong: "Not quite — the finishing wheel is where edges are ground smooth after gluing.", explanation: "At the finishing wheel, the edges of the insole are ground smooth after gluing, bringing the pair to the clean finished look and feel that Hike's quality standard requires." },
  { q: "Which verb governs a Morton's Extension?", difficulty: "medium", options: ["RAISE","RELIEVE","SOFTEN","STIFFEN"], answer: 3, correct: "Correct!", wrong: "Not quite — Morton's Extension blocks joint motion, which is STIFFEN.", explanation: "A Morton's Extension STIFFENs — it blocks motion at the 1st MPJ by providing a rigid lever arm the joint cannot bend against." },
  { q: "What is Poron foam primarily used for in top covers?", difficulty: "easy", options: ["Skin friction reduction on diabetic feet","Shock absorption and durability","Athletic spring and energy return","Structural stiffening of the shell"], answer: 1, correct: "Correct!", wrong: "Not quite — Poron's job is shock absorption and durability.", explanation: "Poron is a denser foam used for shock absorption and durability. It goes under P-Cell on T2 and T3, and is used alone for pure shock control on T13 and T14." },
  { q: "What makes a Charcot foot device different from a standard insole?", difficulty: "hard", options: ["It uses the firmest shell durometer available","It is molded to mirror the collapsed midfoot anatomy for total contact — no corrections","It has the most accommodations of any device type","It always includes a T3 top cover"], answer: 1, correct: "Exactly right!", wrong: "Not quite — Charcot devices use total contact and no corrections.", explanation: "A Charcot device mirrors the collapsed rocker-bottom anatomy for total contact with no aggressive corrections. Nothing is added or cut — the surface itself is the treatment." },
  { q: "The 1st Ray Cutout has which shaped bite out of the shell?", difficulty: "medium", options: ["Straight oblique cut on the medial edge","Round bite out of the medial front corner","Oval relief at the metatarsal head","Straight cut across the full forefoot"], answer: 1, correct: "Correct!", wrong: "Not quite — it's a round bite on the medial front corner.", explanation: "The 1st Ray Cutout is a round bite out of the medial front corner of the shell, centered there and reaching behind the MT line toward the heel." },
  { q: "What does rearfoot posting being 'intrinsic' mean?", difficulty: "medium", options: ["The post is added as a separate printed part under the shell","The post is a hand-glued cork blank","The tilt is built directly into the shell geometry during design","The post is only applied to the forefoot zone"], answer: 2, correct: "That's right!", wrong: "Not quite — intrinsic means the tilt is inside the shell geometry from the start.", explanation: "Intrinsic means the correction is baked into the shell geometry itself during design — no separate part, no hand gluing. The shell prints with the angle already in it." },
  { q: "Both medial and lateral flanges together on the same device creates what?", difficulty: "medium", options: ["A Charcot device","The defining geometry of a UCBL","A Hike Flexible Shell","A Co-Poly Mimic shell"], answer: 1, correct: "Correct!", wrong: "Not quite — medial and lateral flanges together defines the UCBL geometry.", explanation: "Both medial and lateral flanges running simultaneously is the defining geometry of a UCBL — the tall walls on both sides fully enclosing the rearfoot." },
  { q: "What is the default depth of a PT Groove?", difficulty: "hard", options: ["7 mm","2 mm","4 mm","10 mm"], answer: 2, correct: "Correct!", wrong: "Not quite — PT Groove default depth is 4 mm.", explanation: "The PT Groove default depth is 4 mm, with a long and thin oval footprint (aspect ratio ~3.7) running along the peroneus/plantar tendon course." },
  { q: "A Stabilizer heel post is prescribed when:", difficulty: "medium", options: ["The patient has central heel pain or a spur","Maximum rearfoot stability and control is needed","A uniform heel height lift is required","General rearfoot correction without aggressive bias is needed"], answer: 1, correct: "That's right!", wrong: "Not quite — the Stabilizer is for maximum rearfoot control.", explanation: "The Stabilizer is the most controlling heel post — prescribed for significant instability or hypermobility where the heel needs to be firmly held with maximum resistance to rolling." },
  { q: "Which top cover T-codes are in the same material family?", difficulty: "hard", options: ["T1 and T14","T6 and T9","T4 and T7","T5 and T11"], answer: 1, correct: "Correct!", wrong: "Not quite — T6 and T9 are the same athletic spring material family.", explanation: "T6 (1/8\" Spenco) and T9 (1/16\" Neo Sponge) are the same sheet material family — athletic spring — just at different thicknesses." },
  { q: "What is the default height of a medial flange on a standard insole plate?", difficulty: "hard", options: ["20 mm","25 mm","30 mm","35 mm"], answer: 2, correct: "Correct!", wrong: "Not quite — medial plate flange defaults to 30 mm.", explanation: "The medial flange on a standard plate defaults to 30 mm — the tallest of the four flange types, because it holds the arch and needs the most height and wall depth." },
  { q: "What does the Co-Poly Mimic shell replicate?", difficulty: "medium", options: ["The feel of cork underfoot","The stiffness and response of traditional copolymer polypropylene orthotics","The flexibility of the Hike Flexible Shell","The deep heel cup of the UCBL"], answer: 1, correct: "That's right!", wrong: "Not quite — it mimics the rigidity of traditional copolymer polypropylene.", explanation: "The Co-Poly Mimic is a 3D-printed TPU shell engineered to replicate the stiffness and response of traditional copolymer polypropylene lab-made orthotics." },
  { q: "In a stacked prescription, how do you read a Met Bar + Met Head Offload + Arch Reinforcement?", difficulty: "hard", options: ["RAISE + RAISE + RAISE","SOFTEN + RELIEVE + STIFFEN","RAISE + RELIEVE + STIFFEN","STIFFEN + SOFTEN + RAISE"], answer: 2, correct: "Exactly right!", wrong: "Not quite — Met Bar raises, Offload relieves, Arch Reinforcement stiffens.", explanation: "Met Bar = RAISE (redirects load off met heads). Met Head Offload = RELIEVE (removes contact at one head). Arch Reinforcement = STIFFEN (makes the medial wall more resistant). Three verbs, three jobs." },
  { q: "What is the Sensory Bumps default layout?", difficulty: "hard", options: ["8 bumps evenly spaced across the forefoot","16 bumps — 5 at the toes, two diagonals of 3 down the midfoot, 5 at the heel","12 bumps across the full plantar surface","20 bumps following the metatarsal parabola"], answer: 1, correct: "Correct!", wrong: "Not quite — the fixed layout is 16 bumps across three anatomical zones.", explanation: "Sensory Bumps have a fixed 16-bump anatomical layout — 5 along the toe contour, two diagonal rows of 3 down the midfoot, and 5 clustered on the heel." },
  { q: "Which correctly describes Met Head Offload vs Drill and Fill?", difficulty: "hard", options: ["Both remove contact entirely at the met head","Offload removes contact via a well and plug; Drill and Fill is a full-depth aperture through the cover, backfilled flush","Drill and Fill removes contact; Offload softens the zone","They are identical — just different names"], answer: 1, correct: "Perfect — that's the critical distinction!", wrong: "Not quite — offload removes contact via a well; Drill and Fill keeps a continuous walking surface.", explanation: "Met Head Offload cuts a well into the shell with a soft plug — the head never contacts the insole. Drill and Fill is a full-depth aperture through the top cover, backfilled with softer foam. The surface looks flush. Pressure is pushed outward. Mutually exclusive on any given head." },
];

const LETTERS = ['A', 'B', 'C', 'D'];
const TOTAL = QUIZ.length;

const quizState = {
  current: 0,
  score: 0,
  answered: false,
  done: false,
  name: localStorage.getItem('hikeCertName') || '',
};

function $(id) { return document.getElementById(id); }

function persistCert(name, score) {
  const record = {
    name,
    score,
    total: TOTAL,
    pct: Math.round((score / TOTAL) * 100),
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

function setPanel(name) {
  $('quizIntro').hidden = name !== 'intro';
  $('quizCard').hidden = name !== 'ask';
  $('scoreCard').hidden = name !== 'score';
  $('certWrap').hidden = name !== 'cert';
}

function renderQuestion() {
  const q = QUIZ[quizState.current];
  const pct = (quizState.current / TOTAL) * 100;
  $('quizFill').style.width = `${pct}%`;
  $('quizProgressLabel').textContent = `Question ${quizState.current + 1} of ${TOTAL}`;
  $('qNumber').innerHTML = `Question ${quizState.current + 1} <span class="q-tag ${q.difficulty}">${q.difficulty}</span>`;
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
}

function select(idx) {
  if (quizState.answered) return;
  quizState.answered = true;
  const q = QUIZ[quizState.current];
  const opts = [...document.querySelectorAll('#options .option')];
  opts.forEach(o => { o.classList.add('disabled'); o.disabled = true; });
  const exp = $('explanation');
  if (idx === q.answer) {
    quizState.score++;
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
  $('quizNext').textContent = quizState.current < TOTAL - 1 ? 'Next question →' : 'See my score →';
}

function showScore() {
  quizState.done = true;
  setPanel('score');
  const pct = Math.round((quizState.score / TOTAL) * 100);
  $('scoreNumber').textContent = quizState.score;
  const circle = $('scoreCircle');
  circle.className = 'score-circle ' + (pct >= 80 ? 'great' : pct >= 60 ? 'ok' : 'low');
  if (pct >= 80) {
    $('scoreTitle').textContent = 'Excellent work.';
    $('scoreSub').textContent = `You scored ${quizState.score} of ${TOTAL} (${pct}%). You can read a Hike insole — products, accommodations, and the floor.`;
  } else if (pct >= 60) {
    $('scoreTitle').textContent = 'Good effort.';
    $('scoreSub').textContent = `You scored ${quizState.score} of ${TOTAL} (${pct}%). Review the sections that tripped you, then retake if you want a stronger mark on the certificate.`;
  } else {
    $('scoreTitle').textContent = 'Keep studying.';
    $('scoreSub').textContent = `You scored ${quizState.score} of ${TOTAL} (${pct}%). Go back through the chapters and try again — the certificate waits for you.`;
  }
  $('quizFill').style.width = '100%';
  $('quizProgressLabel').textContent = 'Quiz complete';
  $('certName').value = quizState.name;
  $('certName').focus();
}

function fillCertificate(record) {
  $('certPerson').textContent = record.name;
  $('certScore').textContent = `${record.score} / ${record.total}`;
  $('certPct').textContent = `${record.pct}%`;
  $('certDate').textContent = formatDate(record.date);
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
  const record = persistCert(name, quizState.score);
  fillCertificate(record);
  setPanel('cert');
  document.body.classList.add('cert-ready');
}

function restartQuiz() {
  quizState.current = 0;
  quizState.score = 0;
  quizState.answered = false;
  quizState.done = false;
  document.body.classList.remove('cert-ready');
  setPanel('ask');
  renderQuestion();
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
  const w = 1600;
  const h = 1132;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fbfaf8';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#16181d';
  ctx.lineWidth = 4;
  ctx.strokeRect(36, 36, w - 72, h - 72);
  ctx.strokeStyle = '#0a6cff';
  ctx.lineWidth = 2;
  ctx.strokeRect(52, 52, w - 104, h - 104);

  const logo = await loadLogo();
  if (logo) {
    const lw = 220;
    const lh = lw * (logo.height / logo.width);
    ctx.drawImage(logo, (w - lw) / 2, 96, lw, lh);
  }

  ctx.fillStyle = '#0a6cff';
  ctx.font = '600 18px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('HIKE MEDICAL  ·  THE INSOLE BOOK', w / 2, 300);

  ctx.fillStyle = '#16181d';
  ctx.font = '600 54px "New York", "Iowan Old Style", Georgia, serif';
  ctx.fillText('Certificate of Completion', w / 2, 390);

  ctx.fillStyle = '#4c5160';
  ctx.font = '400 22px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('This certifies that', w / 2, 460);

  ctx.fillStyle = '#16181d';
  ctx.font = '600 56px "New York", "Iowan Old Style", Georgia, serif';
  ctx.fillText(record.name, w / 2, 540);

  ctx.fillStyle = '#4c5160';
  ctx.font = '400 22px -apple-system, BlinkMacSystemFont, sans-serif';
  wrapText(ctx,
    'has completed Custom Orthotic Training — bases, accommodations, production, and the four verbs — and can read a Hike insole on sight.',
    w / 2, 610, 980, 32);

  ctx.fillStyle = '#16181d';
  ctx.font = '650 28px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(`Score  ${record.score} / ${record.total}   ·   ${record.pct}%`, w / 2, 760);

  ctx.fillStyle = '#8a8f9c';
  ctx.font = '500 18px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(formatDate(record.date), w / 2, 820);

  ctx.beginPath();
  ctx.moveTo(w / 2 - 160, 920);
  ctx.lineTo(w / 2 + 160, 920);
  ctx.strokeStyle = '#e8e6e1';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = '#8a8f9c';
  ctx.font = '600 13px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('HIKE MEDICAL  ·  TRAINING FLOOR', w / 2, 952);

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
    else {
      setPanel('ask');
      renderQuestion();
    }
  });
  $('quizNext').addEventListener('click', () => {
    quizState.current++;
    if (quizState.current >= TOTAL) showScore();
    else renderQuestion();
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
  const saved = localStorage.getItem('hikeCert');
  if (quizState.done && saved) {
    fillCertificate(JSON.parse(saved));
    setPanel('cert');
    document.body.classList.add('cert-ready');
    return;
  }
  if (quizState.done) {
    setPanel('score');
    return;
  }
  if (quizState.current > 0 || quizState.answered) {
    setPanel('ask');
    renderQuestion();
    return;
  }
  setPanel('intro');
  $('quizFill').style.width = '0%';
  $('quizProgressLabel').textContent = `50 questions`;
}

export function quizBlocksKeys() {
  return !document.getElementById('quiz')?.hidden;
}

/* console helper for training checks — finishes the exam and shows the cert */
window.__quizFinish = (name = 'Alex Rivera', score = 46) => {
  quizState.score = Math.max(0, Math.min(TOTAL, score));
  quizState.done = true;
  quizState.name = name;
  persistCert(name, quizState.score);
  fillCertificate(JSON.parse(localStorage.getItem('hikeCert')));
  setPanel('cert');
  document.body.classList.add('cert-ready');
};
