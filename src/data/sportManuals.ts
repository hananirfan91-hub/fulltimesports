export interface SportManual {
  introduction: string;
  chapters: {
    title: string;
    content: string;
  }[];
  pakistanPerspective: string;
  biochemicalFormulas: string[];
}

export const SPORT_TACTICAL_MANUALS: Record<string, SportManual> = {
  "cricket": {
    introduction: "Cricket inside the raw topography of Pakistan is more than a recreational pastime; it is a meticulous canvas of kinetic energy, thermodynamic air friction, and psychological warfare. This scientific index unpacks the deep structural biomechanics and physical equations that govern elite performance at cricket grounds like Gaddafi Stadium Lahore and Rawalpindi Cricket Ground.",
    chapters: [
      {
        title: "I. The Biomechanics of Rotational Spin Rate & Magnus Effect Trajectories",
        content: "Elite wrist-spinners (leg-spinners) apply intense frictional force to the leather surface of the cricket ball, imparting upward of 2400 to 2800 RPM (revolutions per minute) upon release. According to fluid dynamics, a fast-rotating ball creates a velocity differential in the surrounding airflow. Air on one side of the ball travels faster relative to the surface than on the opponent's side, generating low static pressure in accordance with Bernoulli's Principle. This lateral pressure difference results in a perpendicular force, known as the Magnus Force. For a leg-spinner, this manifests as late side-drift in flights, causing the ball to deviate away from the line of the bat in raw air before hitting the pitch. This late drift, followed by sudden vertical dipping, cuts the batsman's reaction window from the standard 0.45 seconds to a critical, error-prone 0.32 seconds. Pakistan's legendary spinner Shadab Khan and global superstars utilize this mechanical drift to puzzle batsmen in short-format powerplays, bypassing turf friction variations."
      },
      {
        title: "II. Kinetic Chain Synchronization in Babar Azam's Cover Drive",
        content: "The aesthetic excellence of a professional cover drive relies on a precise sequence of kinetic chain link triggers. The energy flow begins when the batsman's lead leg plants firmly onto the wicket soil, transferring reaction force from the ground up through the sub-muscular skeletal frame. The hips rotate first, priming the core abdominal and spinal columns. This is followed by shoulder torque, upper-arm lever extensions, and finally, the rapid uncocking of the wrists. Any breakdown in this sequential synchronization leads to an off-center contact, lifting the ball into the hands of infield cover catchers. In Babar Azam's classical cover drive, high-speed telemetry captures a near-instantaneous wrist stabilizer lock at the point of ball impact. This dampens secondary stick vibrations and maximizes translational momentum, sending the ball at speeds exceeding 140 km/h along the grass turf."
      },
      {
        title: "III. Aerodynamic Seam Positioning & Reverse Swing Thermodynamics",
        content: "Standard forward swing is triggered when the seam of a new cricket ball is held at an angle of 20° to 30° toward the slip-cordons. The raised hand-stitched seam acts as a tripping mechanism, converting the airflow on that side into a turbulent boundary layer, while air on the shiny side remain laminar. This generates an asymmetric boundary layer separation, driving the ball in the direction of the turbulent side. However, in the high-humidity, high-temperature matches of Karachi and Lahore, fast bowlers like Shaheen Shah Afridi exploit secondary boundary transitions known as reverse swing. As the leather ball ages, one side is systematically scuffed and worn with micro-abrasions, while the other is polished with sweat. Above a threshold speed of approximately 85 mph (137 km/h), the scuffed side triggers early turbulent air separation *before* the seam, causing the ball to swing *away* from the rough side (towards the shiny side), contrasting normal swing behavior. This thermodynamic transition requires precise wrist-snap alignment and clean surface maintenance, making reverse swing one of cricket's most fearsome tactics."
      },
      {
        title: "IV. Soil Clay-to-Silt Coefficients & Pitch Degradation Telemetry",
        content: "The interaction of the cricket ball with the wicket turf is highly dependent on the soil's chemistry and geologic composition. Pakistani pitches possess high active clay ratios (typically 50% to 65% montmorillonite clay content) blended with fine silt and sand. This combination yields a high bearing capacity and elastic elasticity when dry, returning maximum energy to short-pitched deliveries. Over the course of a five-day match at Rawalpindi, continuous foot-track impacts and high solar evaporation dry out the wicket, causing the clay particles to contract and form microscopic fissures. This structural degradation decreases the coefficient of rest friction (passing from 0.6 down to 0.42), which dampens ball vertical bounce height while increasing lateral spin traction. This telemetry allows off-spinners to gain massive turn and irregular bounce during final match innings."
      }
    ],
    pakistanPerspective: "Pakistan Super League (PSL) franchises—such as Lahore Qalandars, Peshawar Zalmi, and Multan Sultans—are pioneers in deploying integrated radar tracking and wearable biometrics. By mapping bowlers' humeral rotation angles and footwork ground reaction forces, FTS analysts can detect micro-fatigue parameters before injury thresholds are breached, preserving Pakistan's legendary pace-bowling depth.",
    biochemicalFormulas: [
      "F_Magnus = p * V * G",
      "Coefficient of Friction (u) = F_friction / F_normal",
      "Kinetic Hammer energy (E) = 0.5 * I * w^2"
    ]
  },
  "football": {
    introduction: "In modern soccer, spatial geometry has overtaken raw kinetic athleticism. This tactical manual dissects the computational math of structural positioning, passing networks, and regional grassroots developments across Pakistan.",
    chapters: [
      {
        title: "I. Spatial Geometry & Inverted Fullback Central Pivots",
        content: "Under tactical systems popularized by elite football coaches like Pep Guardiola, fullbacks no longer simply dash down standard touchlines. Instead, during build-up phases, fullbacks invert diagonally into central midfield, forming a double-pivot with the defensive midfielder. This inversion shifts the team's shape from a standard 4-3-3 into a structured 3-2-4-1. This layout accomplishes three critical goals: first, it provides midfield numerical superiority (+1 passing channel over opposition mid-blocks); second, it secures central rest-defense spaces, blocking easy counter-attack lanes; and third, it gives the team's creative wingers 1v1 isolation opportunities against opponent outside backs on the wings. FTS telemetry monitors spatial compression ratios, verifying that teams using inverted fullbacks recover loose balls 1.8 seconds faster in central zones."
      },
      {
        title: "II. Deceleration Latencies & Biomechanical Fatigue of Wing-Backs",
        content: "The physical strain on wide players is immense, requiring rapid sprints coupled with sudden decelerations. During high-intensity matches, player tracking shows wingbacks cover up to 11.5 kilometers per game, with over 800 meters of high-intensity running. Acceleration is driven by concentric quadriceps contractions, while deceleration is managed by heavy eccentric hamstring and gluteal load absorption. Deceleration forces often reach 4.5 times the player's body weight, putting massive eccentric strain on tendon junctions. If muscle recovery is incomplete, these deceleration forces lead to micro-tears in muscle fibers or hamstring pulls, highlighting the importance of biometric tracking and workload management during busy league schedules."
      },
      {
        title: "III. High Pressing Schemas & Zonal Passing Compressions",
        content: "An effective high press relies on coordinated zonal compression rather than simply chasing the football. Players work as a unit to cut off passing lanes to the opponent's creative playmakers. This is achieved by setting a localized 'pressing trigger'—such as a slow, bouncing pass to a side defender or a pass played to a player's weak foot. The pressing team instantly narrows its defensive width, crowding the area around the ball and leaving far-side players uncovered. This zonal compression forces the defender into a rushed long clearance, returning possession to the pressing side. FTS statistics show that top-performing pressing sides recover possession within 6 seconds of losing the ball."
      }
    ],
    pakistanPerspective: "While historically centered globally, Pakistan's domestic football scene—including the Pakistan Football Federation (PFF) National Challenge Cup and regional Lahore leagues—is undergoing a tactical modernization. Coaches are adopting structured defensive blocks, focusing on quick diagonal transitions to maximize the raw pace of young Pakistani strikers.",
    biochemicalFormulas: [
      "Pressing Compaction Ratio (CR) = Area_defending / Area_total",
      "Eccentric Hamstring Load = Mass * Acceleration_decel",
      "Passing Lane Angle (theta) = arctan(y/x)"
    ]
  },
  "formula-1": {
    introduction: "Formula 1 represents the absolute peak of modern automotive engineering. The sport is won in high-speed wind tunnels and digital simulation centers, optimizing pneumatic grip and aerodynamic force.",
    chapters: [
      {
        title: "I. Underbody Venturi Tunnels & Ground-Effect Aerodynamics",
        content: "The return to ground-effect aerodynamics in modern F1 focused downforce production on the car's underside rather than drag-heavy top-side wings. Ground-effect is driven by underbody Venturi tunnels running along the floor of the monocoque. As air enters these narrow channels, it is forced to accelerate, creating a localized zone of low dynamic pressure in accordance with Bernoulli's equation. This low pressure generates a vacuum that sucks the chassis directly onto the track surface, producing massive downforce with minimal induced drag. This aerodynamic approach allows cars to follow closely behind others without losing front-wing grip from clean air wake disturbances."
      },
      {
        title: "II. Pneumatic Slip Angles & High-Speed Cornering Friction",
        content: "Cornering performance relies on maximizing the friction coefficient between the rubber tire and the track asphalt. This tire-to-road friction is dynamic, varying with track temperature, rubber compound elasticity, and slip angle. The slip angle is the difference between the wheel's actual rolling direction and the direction the carcass is pointed. Grip peaks at modest slip angles (typically 3° to 6° depending on chemical compounds), where the tire rubber actively shears against track micro-textures. This dynamic friction supports cornering speeds exceeding 160 mph, pulling lateral forces of up to 5G on drivers' neck muscles."
      }
    ],
    pakistanPerspective: "Pakistan's interest in karting, local track days, and virtual motorsport simulators is growing rapidly. Aspiring local engineers study computational fluid dynamics (CFD) to optimize telemetry models for international Formula and touring car teams, establishing a foothold in international motorsport engineering.",
    biochemicalFormulas: [
      "Downforce (D) = 0.5 * C_L * p * A * V^2",
      "Slip Angle (alpha) = delta - arctan(V_y / V_x)",
      "Venturi Suction Pressure = P_static + 0.5 * p * V^2"
    ]
  },
  "tennis": {
    introduction: "Tennis is a sport of rapid direction changes and heavy spin revolutions. Understanding court surface friction and ball aerodynamics is key to elite-level court coverage.",
    chapters: [
      {
        title: "I. Sliding Physics on Clay & Hard Court Deceleration",
        content: "Sliding on tennis courts is a delicate balance of static and dynamic friction. On clay surfaces, players slide by gliding on loose brick dust, dropping their center of gravity to decelerate safely while striking groundstrokes. This slide-and-hit technique saves up to 1.5 seconds in baseline recovery time compared to hard courts. On hard courts, sliding requires specialized rubber outsoles and high ankle strength to absorb high-impact stopping forces without twisting joints."
      },
      {
        title: "II. Racket Flex, String Tension & Topspin Magnus Aerodynamics",
        content: "Inducing topspin requires brushing the ball from low to high with an angled racket face. This contact flexes the tennis strings, storing elastic energy before snapping back to rotate the ball. Heavy topspin (exceeding 3200 RPM) induces the Magnus effect, forcing air pressure on top of the ball to rise, resulting in a steep downwards drop that keeps high-velocity groundstrokes within baseline boundaries."
      }
    ],
    pakistanPerspective: "Pakistani tennis, led by global doubles star Aisam-ul-Haq Qureshi, has always prioritized clay-court tactical placement and baseline endurance. Local academies utilize high-speed video analysis to optimize juniors' service kinetics and contact-point efficiency.",
    biochemicalFormulas: [
      "Dynamic Friction Coefficient (u_k) = F_slide / F_gravity",
      "Magnus Force (F_m) = 2 * pi * r^3 * w * p * d",
      "String Tension Torque (T) = Tension * cos(theta)"
    ]
  },
  "hockey": {
    introduction: "Field hockey on synthetic turf is a lightning-fast sport defined by high-velocity shots and long diagonal passes.",
    chapters: [
      {
        title: "I. Drag-Flick Kinetic Slingshot Mechanics",
        content: "The drag-flick is hockey's fastest set-piece tool, with shot speeds exceeding 120 km/h. It relies on a continuous kinetic chain: players drag the ball from behind their body, creating a long contact arc that accelerates the ball along the stick. Force flows up from the feet through the hips, torso, shoulder rotation, and final wrist snap, launching the ball with immense velocity."
      },
      {
        title: "II. Stick Composite Elasticity & Wet Turf Ball Speed",
        content: "Modern hockey sticks use carbon-composite blends to maximize structural stiffness. This high-carbon makeup reduces energy loss from stick flex, shifting maximum kinetic power directly to the ball during hard strikes. Additionally, watering the synthetic turf reduces surface friction, ensuring smooth, high-velocity ball rolls across the field."
      }
    ],
    pakistanPerspective: "As a former global powerhouse, Pakistan's national hockey system is modernizing its tactical frameworks. Coaches focus on scientific scouting and modern fitness conditioning to recover the high-speed style that defined Pakistan's historic hockey victories.",
    biochemicalFormulas: [
      "Ball Release Velocity (V) = w * r_lever",
      "Turf Ball Speed Decay (a) = -g * Coefficient_friction",
      "Stick Elastic Energy (U) = 0.5 * k * x^2"
    ]
  },
  "basketball": {
    introduction: "Basketball is a sport of space, angles, and rotational physics. Analytics-driven shooting models now dominate professional gameplay and training.",
    chapters: [
      {
        title: "I. Three-Point Shooting Trajectory Analytics",
        content: "Elite three-point shooting requires an optimal release angle and consistent backspin. Biomechanical studies show a launch angle of 45° to 48° is ideal, maximizing the entry angle into the baseline rim. Sustained backspin (3-4 Hz) stabilizes ball flight against air turbulence and softens bounces off the rim, increasing conversion margins."
      },
      {
        title: "II. Perimeter Spacing & High-Efficiency Offense Models",
        content: "Advanced statistics have restructured basketball offenses, prioritizing high-value three-point shots and layups over low-conversion mid-range jumpers. Offenses focus on perimeter spacing and quick ball movement, stretching the defense to create open drive-and-kick options."
      }
    ],
    pakistanPerspective: "Pakistan's domestic basketball scene is expanding rapidly in urban centers like Lahore, Islamabad, and Karachi. Fast-paced regional leagues utilize video tracking to analyze shot charts, helping young players build analytical, high-efficiency court movement.",
    biochemicalFormulas: [
      "Launch Angle Arc (y) = x*tan(theta) - (g*x^2)/(2*V_0^2*cos^2(theta))",
      "Expected Premium Points (EPV) = 3 * P_3pt + 2 * P_2pt",
      "Rotational Drag Torque (t) = 0.5 * p * C_d * A * r * w^2"
    ]
  },
  "esports": {
    introduction: "Esports requires elite neurological reflexes and sub-millisecond hardware inputs. This guide dissects competitive latency and aiming mechanics.",
    chapters: [
      {
        title: "I. Neural Reaction Windows & Input-to-Display Latency",
        content: "Top-tier gaming matches are decided in milliseconds. Total latency is the sum of human visual reaction time (typically 140ms to 180ms), mouse polling delay, game render time, and display refresh lag. High refresh displays (240Hz+) and 1000Hz+ mouse sensors reduce system latency to under 5ms, giving players maximum tracking accuracy."
      },
      {
        title: "II. Aiming Muscle Memory & Flick-Shot Biomechanics",
        content: "Precise aiming combines fine motor finger movements with shoulder-pivoted arm sweeps. Flick-shooting requires rapid, muscle-memory-driven arm movements, decelerating the mouse exactly onto targets before clicking. Players use consistent 'eDPI' (effective DPI) values to ensure reliable physical-to-screen movement ratios."
      }
    ],
    pakistanPerspective: "Led by superstars like Tekken world champion Arslan Ash, Pakistan has established itself as an esports powerhouse. Local clubs invest in dedicated gaming facilities, analyzing matches and reflex telemetry to build international-grade training pipelines.",
    biochemicalFormulas: [
      "Total Reaction Time (ms) = t_neural + t_hardware + t_display",
      "Effective eDPI = Mouse_DPI * Game_Sensitivity",
      "Display Frame Time (ms) = 1000 / Refresh_Rate_Hz"
    ]
  },
  "volleyball": {
    introduction: "Volleyball plays are defined by rapid vertical leaps, heavy jump-serves, and complex defensive positioning.",
    chapters: [
      {
        title: "I. Vertical Jump Biomechanics & Arm-Swing Kinetics",
        content: "An elite vertical leap requires a coordinated, explosive multi-joint jump approach. Players quickly transform horizontal velocity into vertical lift by planting their feet, driving force upward through the ankles, knees, hips, and shoulders, reaching spike heights of over 11 feet."
      },
      {
        title: "II. Topspin Jump-Serve Aerodynamics",
        content: "A successful jump-serve relies on heavy topspin, struck on the ball's upper half. This rotation creates a pressure differential that forces the ball to dive sharply past the net, making it highly difficult for defenders to control."
      }
    ],
    pakistanPerspective: "Pakistan has a proud volleyball tradition, with the national team competing strongly in Asian tournaments. Training centers utilize biomechanical analysis to optimize vertical leaps and speed up defensive blocks against fast opponents.",
    biochemicalFormulas: [
      "Jump Height (h) = V_takeoff^2 / (2 * g)",
      "Topspin Magnus Force (F) = C_L * 0.5 * p * A * V^2",
      "Contact Hand Impact Energy = Mass_arm * Acceleration_strike"
    ]
  }
};
