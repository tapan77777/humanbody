// Injury data keyed by zone ID matching ZONES in BodySVG.jsx.
// Paired zones (left-*/right-*) share the same array reference.

const head = [
  {
    id: 'concussion',
    name: 'Concussion',
    severity: 'moderate',
    overview: 'A traumatic brain injury caused by a blow or jolt to the head that temporarily disrupts normal brain function.',
    symptoms: ['Headache or pressure in the head', 'Confusion and difficulty concentrating', 'Nausea or vomiting'],
    causes: ['Direct blow to the head during contact sport', 'Fall or collision causing rapid head acceleration'],
    firstAid: [
      'Remove the person from activity immediately and do not leave them alone.',
      'Apply ice wrapped in cloth to any external swelling for 20 minutes.',
      'Seek medical evaluation before any return to activity.',
    ],
    recoveryWeeks: 4,
    warningSign: 'Seek emergency care for repeated vomiting, seizures, one pupil larger than the other, or loss of consciousness.',
  },
  {
    id: 'scalp-laceration',
    name: 'Scalp Laceration',
    severity: 'mild',
    overview: 'A cut or tear in the scalp that often bleeds heavily due to the high density of blood vessels in the area.',
    symptoms: ['Profuse bleeding from the head', 'Visible wound or flap in the scalp', 'Localised pain and swelling'],
    causes: ['Impact with a sharp or hard object', 'Fall onto a hard surface'],
    firstAid: [
      'Apply firm, direct pressure with a clean cloth for at least 10 minutes without lifting.',
      'Do not remove any embedded objects; stabilise them in place.',
      'Seek medical attention — scalp wounds frequently require staples or sutures.',
    ],
    recoveryWeeks: 2,
    warningSign: 'Go to emergency care if bleeding does not slow after 10 minutes of direct pressure or if the wound is deep.',
  },
]

const neck = [
  {
    id: 'whiplash',
    name: 'Whiplash',
    severity: 'mild',
    overview: 'A soft-tissue injury to the neck caused by a rapid back-and-forth motion that strains muscles and ligaments.',
    symptoms: ['Neck pain and stiffness worsening the day after injury', 'Reduced range of motion', 'Headaches starting at the base of the skull'],
    causes: ['Rear-end vehicle collision', 'Contact sport tackle or collision'],
    firstAid: [
      'Apply ice to the neck for 20 minutes every 2–3 hours during the first 48 hours.',
      'Take over-the-counter pain relief (ibuprofen or paracetamol) as directed.',
      'Maintain gentle, normal movement — avoid prolonged use of a collar.',
    ],
    recoveryWeeks: 6,
    warningSign: 'See a doctor urgently for tingling or weakness in the arms, severe headache, or pain radiating into the shoulder.',
  },
  {
    id: 'cervical-strain',
    name: 'Cervical Muscle Strain',
    severity: 'mild',
    overview: 'An overstretching or micro-tearing of the muscles or tendons supporting the cervical spine, typically from poor posture or overexertion.',
    symptoms: ['Aching or burning neck pain', 'Muscle spasms and tenderness on palpation', 'Stiffness worse in the morning'],
    causes: ['Sustained poor posture (e.g., prolonged screen use)', 'Sudden awkward movement or heavy lifting'],
    firstAid: [
      'Rest and avoid activities that aggravate the pain for the first 24–48 hours.',
      'Apply heat after 48 hours to relax tight muscles — use a heat pack for 15 minutes.',
      'Perform gentle neck range-of-motion exercises once acute pain subsides.',
    ],
    recoveryWeeks: 3,
    warningSign: 'Consult a doctor if pain persists beyond two weeks, or if you develop arm weakness, numbness, or pins and needles.',
  },
]

const shoulder = [
  {
    id: 'rotator-cuff-tear',
    name: 'Rotator Cuff Tear',
    severity: 'moderate',
    overview: 'A tear in one or more of the four tendons that stabilise the shoulder joint, causing pain and weakness during overhead movements.',
    symptoms: ['Deep aching pain in the shoulder, especially at night', 'Weakness when lifting or rotating the arm', 'Crackling sensation with shoulder movement'],
    causes: ['Repetitive overhead activities such as throwing or swimming', 'Single acute injury from a fall or heavy lift'],
    firstAid: [
      'Rest the shoulder and avoid overhead or painful movements.',
      'Apply ice wrapped in a cloth for 20 minutes every 3–4 hours to reduce swelling.',
      'Support the arm in a sling for comfort and see a doctor for imaging.',
    ],
    recoveryWeeks: 12,
    warningSign: 'Seek prompt medical review for sudden, complete loss of shoulder strength or inability to raise the arm at all.',
  },
  {
    id: 'shoulder-dislocation',
    name: 'Shoulder Dislocation',
    severity: 'moderate',
    overview: 'The head of the humerus is forced out of the shoulder socket, making it the most commonly dislocated large joint in the body.',
    symptoms: ['Visible deformity or asymmetry of the shoulder', 'Intense, sharp pain and muscle spasm', 'Numbness or tingling down the arm'],
    causes: ['Fall onto an outstretched hand', 'Direct blow to the shoulder in contact sports'],
    firstAid: [
      'Immobilise the arm in the position found using a sling or padding — do not attempt to relocate it yourself.',
      'Apply ice to the area to limit swelling.',
      'Transport to emergency care immediately for professional reduction and X-ray.',
    ],
    recoveryWeeks: 12,
    warningSign: 'Go to emergency care immediately — attempting self-reduction can fracture the humerus or damage nerves and blood vessels.',
  },
]

const chest = [
  {
    id: 'rib-fracture',
    name: 'Rib Fracture',
    severity: 'moderate',
    overview: 'A break in one or more ribs, most often caused by direct trauma, which causes pain that is significantly worsened by breathing or movement.',
    symptoms: ['Sharp chest pain that worsens with breathing, coughing, or twisting', 'Tenderness directly over the affected rib', 'Shallow breathing to avoid pain'],
    causes: ['Direct blow to the chest in sport or a fall', 'Severe or prolonged coughing'],
    firstAid: [
      'Encourage the person to breathe normally despite the pain — shallow breathing risks pneumonia.',
      'Apply ice to the affected area for 20 minutes to reduce swelling.',
      'Seek medical evaluation to rule out pneumothorax or internal injury.',
    ],
    recoveryWeeks: 6,
    warningSign: 'Call emergency services for increasing shortness of breath, coughing blood, or a bluish tinge to the lips.',
  },
  {
    id: 'pectoral-muscle-strain',
    name: 'Pectoral Muscle Strain',
    severity: 'mild',
    overview: 'A stretch or partial tear of the pectoralis major muscle, typically occurring during heavy pressing or throwing movements.',
    symptoms: ['Sudden sharp pain in the chest or front of the shoulder', 'Bruising and swelling across the chest wall', 'Weakness in pushing or pressing movements'],
    causes: ['Excessive load during bench press or weightlifting', 'Sudden forced stretching of the arm in a fall'],
    firstAid: [
      'Stop the activity immediately and rest the arm.',
      'Apply ice for 20 minutes every 2–3 hours during the first 48 hours.',
      'Keep the arm supported in a sling and arrange physiotherapy assessment.',
    ],
    recoveryWeeks: 8,
    warningSign: 'See a doctor urgently if a snap or pop was heard/felt, as complete tendon rupture requires surgical repair.',
  },
]

const elbow = [
  {
    id: 'tennis-elbow',
    name: 'Tennis Elbow (Lateral Epicondylitis)',
    severity: 'mild',
    overview: 'Overuse-related degeneration of the tendons attaching the forearm extensor muscles to the lateral epicondyle of the humerus.',
    symptoms: ['Burning pain on the outer elbow, worsened by gripping', 'Weak grip strength', 'Pain radiating down the forearm'],
    causes: ['Repetitive wrist and forearm movements (tennis, typing, painting)', 'Sudden increase in training load'],
    firstAid: [
      'Rest from aggravating activities and apply ice for 15–20 minutes several times a day.',
      'Use a forearm strap (counterforce brace) during daily tasks to offload the tendon.',
      'Begin gentle eccentric wrist extension exercises once acute pain settles.',
    ],
    recoveryWeeks: 8,
    warningSign: 'See a doctor if pain is severe, constant at rest, or associated with swelling that does not improve within 2–3 weeks.',
  },
  {
    id: 'olecranon-bursitis',
    name: 'Olecranon Bursitis',
    severity: 'mild',
    overview: 'Inflammation and fluid accumulation in the bursa at the tip of the elbow, causing a prominent, soft swelling.',
    symptoms: ['Visible swelling at the tip of the elbow', 'Pain or tenderness when leaning on the elbow', 'Warmth and redness over the bursa if infected'],
    causes: ['Prolonged pressure on the elbow (desk work, hard surfaces)', 'Direct blow or fall onto the elbow'],
    firstAid: [
      'Pad the elbow to avoid further pressure and reduce friction.',
      'Apply ice wrapped in a cloth for 20 minutes to reduce swelling.',
      'Seek medical review if the area is hot, red, and swollen — infection requires antibiotics or drainage.',
    ],
    recoveryWeeks: 4,
    warningSign: 'See a doctor promptly if the swelling is warm, red, or accompanied by fever — infected bursitis requires urgent treatment.',
  },
]

const wrist = [
  {
    id: 'wrist-sprain',
    name: 'Wrist Sprain',
    severity: 'mild',
    overview: 'A stretching or tearing of the ligaments connecting the wrist bones, usually caused by a fall onto an outstretched hand.',
    symptoms: ['Pain and tenderness around the wrist joint', 'Swelling and bruising', 'Limited range of wrist motion'],
    causes: ['Fall onto an outstretched hand (FOOSH mechanism)', 'Sudden twisting force on the wrist in sport'],
    firstAid: [
      'Apply the RICE protocol: rest, ice (20 min), compression bandage, and elevate the hand above heart level.',
      'Immobilise with a wrist splint for comfort during the first 24–48 hours.',
      'Seek an X-ray to exclude a fracture if swelling is significant or weight-bearing is painful.',
    ],
    recoveryWeeks: 3,
    warningSign: 'See a doctor if pain is located directly over the anatomical snuffbox — this suggests a scaphoid fracture.',
  },
  {
    id: 'scaphoid-fracture',
    name: 'Scaphoid Fracture',
    severity: 'moderate',
    overview: 'A fracture of the scaphoid bone in the wrist that is notorious for being missed on initial X-ray and for a high risk of non-union if untreated.',
    symptoms: ['Pain and tenderness in the anatomical snuffbox (base of thumb)', 'Swelling without obvious deformity', 'Weak grip and pain with pinching'],
    causes: ['Fall onto an outstretched hand', 'High-impact sport collision'],
    firstAid: [
      'Immobilise the wrist and thumb immediately with a splint or firm bandage.',
      'Apply ice to reduce swelling.',
      'Seek urgent medical review and imaging — early treatment is essential to prevent avascular necrosis.',
    ],
    recoveryWeeks: 12,
    warningSign: 'Seek immediate medical attention — delayed diagnosis causes non-union requiring surgery and can lead to permanent wrist arthritis.',
  },
]

const abdomen = [
  {
    id: 'abdominal-strain',
    name: 'Abdominal Muscle Strain',
    severity: 'mild',
    overview: 'A tear or overstretching of one of the abdominal muscles, commonly the rectus abdominis, caused by sudden exertion or twisting.',
    symptoms: ['Sudden sharp pain in the abdomen during exertion', 'Muscle spasm and tenderness on palpation', 'Pain worsened by sit-ups, coughing, or sneezing'],
    causes: ['Sudden twisting or forceful contraction during sport', 'Rapid increase in core training intensity'],
    firstAid: [
      'Stop activity and rest in a comfortable position with knees slightly bent.',
      'Apply ice to the tender area for 20 minutes every 3 hours for the first 48 hours.',
      'Avoid crunches and heavy lifting until pain-free; progress gradually to core exercises.',
    ],
    recoveryWeeks: 4,
    warningSign: 'See a doctor if pain is severe, you cannot stand upright, or you notice a bulge in the abdominal wall suggesting a hernia.',
  },
  {
    id: 'sports-hernia',
    name: 'Sports Hernia (Athletic Pubalgia)',
    severity: 'moderate',
    overview: 'A weakening or partial tear of the posterior inguinal wall causing chronic groin pain without a palpable hernial bulge.',
    symptoms: ['Deep groin or lower abdominal pain during sprinting and cutting', 'Pain relieved by rest but returning with activity', 'Bilateral or one-sided tenderness at the pubic tubercle'],
    causes: ['Repetitive hip flexion and trunk rotation in football, hockey, or wrestling', 'Muscle imbalance between hip adductors and abdominals'],
    firstAid: [
      'Cease sporting activity and rest for a minimum of one week.',
      'Apply ice and take NSAIDs as directed for pain management.',
      'Arrange physiotherapy for a structured rehabilitation programme before considering surgical options.',
    ],
    recoveryWeeks: 12,
    warningSign: 'Consult a sports medicine physician if pain prevents return to play after 6–8 weeks of conservative management.',
  },
]

const hip = [
  {
    id: 'hip-flexor-strain',
    name: 'Hip Flexor Strain',
    severity: 'mild',
    overview: 'A tear in the iliopsoas or rectus femoris muscles at the front of the hip, commonly seen in sprinters and kicking athletes.',
    symptoms: ['Sharp pain at the front of the hip or groin during kicking or running', 'Swelling or bruising in the upper thigh', 'Stiffness and discomfort when lifting the knee'],
    causes: ['Explosive sprinting or kicking movement', 'Inadequate warm-up before high-intensity activity'],
    firstAid: [
      'Stop activity immediately and rest in a position that eases the pain.',
      'Apply ice to the hip flexor area for 20 minutes every 3 hours for 48 hours.',
      'Begin gentle hip flexor stretching and progressive strengthening once acute pain resolves.',
    ],
    recoveryWeeks: 4,
    warningSign: 'See a doctor if you heard a pop at the time of injury, have severe swelling, or cannot bear weight on the leg.',
  },
  {
    id: 'hip-labral-tear',
    name: 'Hip Labral Tear',
    severity: 'moderate',
    overview: 'A tear in the fibrocartilaginous labrum that lines the hip socket, causing pain and a catching sensation deep in the hip joint.',
    symptoms: ['Deep anterior hip or groin pain worsened by sitting for long periods', 'Clicking, locking, or catching sensation in the hip', 'Limited hip range of motion and stiffness'],
    causes: ['Repetitive pivoting or deep squatting movements in sport', 'Structural hip abnormality (femoroacetabular impingement)'],
    firstAid: [
      'Rest and avoid hip movements that provoke the catching or pain.',
      'Apply ice and use anti-inflammatory medication as directed.',
      'Seek orthopaedic review — imaging (MRI arthrogram) is required for diagnosis.',
    ],
    recoveryWeeks: 16,
    warningSign: 'See a specialist if pain significantly limits walking, work, or sleep, as untreated tears can lead to early hip arthritis.',
  },
]

const knee = [
  {
    id: 'acl-tear',
    name: 'ACL Tear',
    severity: 'severe',
    overview: 'A complete or partial rupture of the anterior cruciate ligament, a primary knee stabiliser, most often occurring during non-contact deceleration or pivoting.',
    symptoms: ['Loud pop heard or felt at the time of injury', 'Rapid onset of significant knee swelling within hours', 'Feeling of instability or "giving way" when trying to pivot'],
    causes: ['Sudden deceleration combined with a change of direction', 'Landing with the knee in valgus (knee caving inward)'],
    firstAid: [
      'Immobilise the knee and apply ice immediately; do not attempt to walk without support.',
      'Elevate the leg and apply a compression bandage to control swelling.',
      'Arrange urgent orthopaedic review — surgical vs. non-surgical management must be assessed.',
    ],
    recoveryWeeks: 36,
    warningSign: 'Seek emergency care if severe vascular injury is suspected (cold, pale foot) or if the knee cannot be straightened.',
  },
  {
    id: 'meniscus-tear',
    name: 'Meniscus Tear',
    severity: 'moderate',
    overview: 'A tear in the crescent-shaped cartilage that cushions and stabilises the knee joint, commonly caused by twisting under load.',
    symptoms: ['Joint-line pain (inner or outer knee)', 'Swelling developing over 24–48 hours', 'Locking or inability to fully straighten the knee'],
    causes: ['Twisting the knee while the foot is planted during sport', 'Degenerative wear in adults over 40'],
    firstAid: [
      'Apply RICE protocol: rest, ice, compression, elevation.',
      'Avoid deep squatting and pivoting until assessed.',
      'Arrange orthopaedic evaluation — MRI will determine if surgical repair is needed.',
    ],
    recoveryWeeks: 12,
    warningSign: 'See a doctor urgently if the knee is locked and cannot be straightened, as a displaced fragment may require immediate surgery.',
  },
]

const ankle = [
  {
    id: 'lateral-ankle-sprain',
    name: 'Lateral Ankle Sprain',
    severity: 'mild',
    overview: 'Stretching or tearing of the lateral ligaments (most commonly the ATFL) caused by the ankle rolling inward, the most frequent sports injury.',
    symptoms: ['Immediate pain and tenderness over the outer ankle', 'Rapid swelling and bruising', 'Difficulty bearing weight'],
    causes: ['Landing awkwardly from a jump or step', 'Running on uneven terrain'],
    firstAid: [
      'Apply RICE immediately: rest off the foot, ice for 20 minutes, compression bandage, and elevate above heart level.',
      'Use crutches if weight-bearing is too painful.',
      'Begin ankle mobility and balance exercises as soon as tolerated to prevent re-injury.',
    ],
    recoveryWeeks: 4,
    warningSign: 'Get an X-ray if bone tenderness is present at the base of the 5th metatarsal or posterior fibula — Ottawa Rules indicate likely fracture.',
  },
  {
    id: 'achilles-tendon-rupture',
    name: 'Achilles Tendon Rupture',
    severity: 'severe',
    overview: 'A complete tear of the Achilles tendon, typically occurring 2–6 cm above the heel in athletes aged 30–50 during explosive push-off.',
    symptoms: ['Sudden sharp pain in the back of the ankle as if struck', 'A palpable gap in the tendon above the heel', 'Inability to rise onto the tiptoe of the affected foot'],
    causes: ['Explosive push-off during sprinting or jumping', 'Rapid increase in training load after a period of inactivity'],
    firstAid: [
      'Immobilise the ankle immediately in a plantarflexed (toes-down) position using a splint.',
      'Apply ice and keep the foot elevated.',
      'Transport to emergency care — prompt orthopaedic review is required to decide between surgical and conservative management.',
    ],
    recoveryWeeks: 36,
    warningSign: 'Seek emergency care immediately — delay in treatment significantly worsens outcomes and increases re-rupture risk.',
  },
]

export default {
  head,
  neck,
  'left-shoulder':  shoulder,
  'right-shoulder': shoulder,
  chest,
  'left-elbow':  elbow,
  'right-elbow': elbow,
  'left-wrist':  wrist,
  'right-wrist': wrist,
  abdomen,
  hip,
  'left-knee':  knee,
  'right-knee': knee,
  'left-ankle':  ankle,
  'right-ankle': ankle,
}
