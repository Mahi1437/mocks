from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============== BITSAT MOCK TEST QUESTIONS ==============

# SECTION 1: PHYSICS (30 Questions)
PHYSICS_QUESTIONS = [
    {"id": 1, "question": "A particle moves along a straight line such that its displacement at any time t is given by s = t³ - 6t² + 3t + 4 meters. Find the velocity when the acceleration is zero.", "options": {"A": "-9 m/s", "B": "0 m/s", "C": "-12 m/s", "D": "3 m/s"}, "correct_answer": "A", "hint": "v = ds/dt, a = dv/dt. Set a = 0 to find t, then calculate v."},
    {"id": 2, "question": "A body is projected vertically upward with velocity 40 m/s. The displacement after 5s is (g = 10 m/s²):", "options": {"A": "50 m", "B": "75 m", "C": "100 m", "D": "125 m"}, "correct_answer": "B", "hint": "Use s = ut + ½at² with proper signs."},
    {"id": 3, "question": "The dimension of Planck's constant is same as:", "options": {"A": "Energy", "B": "Linear momentum", "C": "Angular momentum", "D": "Force"}, "correct_answer": "C", "hint": "E = hν, find dimensions of h."},
    {"id": 4, "question": "Two vectors A and B have magnitudes 3 and 4 respectively. If A × B = 6k̂, then A · B equals:", "options": {"A": "6", "B": "8", "C": "10", "D": "6√3"}, "correct_answer": "D", "hint": "Use |A × B| = AB sinθ and A · B = AB cosθ."},
    {"id": 5, "question": "A particle moves in a circle of radius 5 cm with constant speed and time period 0.2π s. The acceleration of the particle is:", "options": {"A": "5 m/s²", "B": "10 m/s²", "C": "15 m/s²", "D": "25 m/s²"}, "correct_answer": "A", "hint": "Use a = ω²r = (2π/T)²r."},
    {"id": 6, "question": "The escape velocity from the surface of earth is ve. The escape velocity from a planet whose mass and radius are 3 times those of earth is:", "options": {"A": "ve", "B": "3ve", "C": "9ve", "D": "27ve"}, "correct_answer": "A", "hint": "ve = √(2GM/R), substitute 3M and 3R."},
    {"id": 7, "question": "A spring of force constant k is cut into two equal parts. The force constant of each part is:", "options": {"A": "k", "B": "2k", "C": "k/2", "D": "4k"}, "correct_answer": "B", "hint": "Force constant is inversely proportional to length."},
    {"id": 8, "question": "The moment of inertia of a uniform circular disc about its diameter is I. Its moment of inertia about an axis perpendicular to its plane and passing through center is:", "options": {"A": "I", "B": "2I", "C": "I/2", "D": "4I"}, "correct_answer": "B", "hint": "Use perpendicular axis theorem."},
    {"id": 9, "question": "Two identical balls A and B are moving with velocities +0.5 m/s and -0.3 m/s respectively. If they collide head on elastically, their velocities after collision are:", "options": {"A": "+0.5 m/s and -0.3 m/s", "B": "-0.3 m/s and +0.5 m/s", "C": "+0.3 m/s and -0.5 m/s", "D": "-0.5 m/s and +0.3 m/s"}, "correct_answer": "B", "hint": "In elastic collision of identical masses, velocities get exchanged."},
    {"id": 10, "question": "A Carnot engine working between 300K and 600K has work output 800J per cycle. The heat absorbed from the source is:", "options": {"A": "800 J", "B": "1200 J", "C": "1600 J", "D": "2400 J"}, "correct_answer": "C", "hint": "Efficiency η = 1 - T₂/T₁ = W/Q₁."},
    {"id": 11, "question": "The pressure of a gas is increased by 50% at constant temperature. The decrease in volume will be:", "options": {"A": "50%", "B": "33.33%", "C": "40%", "D": "66.67%"}, "correct_answer": "B", "hint": "Use Boyle's law: P₁V₁ = P₂V₂."},
    {"id": 12, "question": "Two point charges +q and -q are placed at distance d apart. The electric field at the midpoint is:", "options": {"A": "Zero", "B": "kq/d² towards -q", "C": "2kq/d² towards +q", "D": "8kq/d² towards -q"}, "correct_answer": "D", "hint": "Fields due to both charges add up at midpoint."},
    {"id": 13, "question": "The equivalent capacitance of two capacitors of 6μF and 3μF connected in series is:", "options": {"A": "9 μF", "B": "3 μF", "C": "2 μF", "D": "18 μF"}, "correct_answer": "C", "hint": "1/Ceq = 1/C₁ + 1/C₂ for series combination."},
    {"id": 14, "question": "A wire of resistance R is stretched to double its length. Its new resistance will be:", "options": {"A": "R", "B": "2R", "C": "4R", "D": "R/2"}, "correct_answer": "C", "hint": "R = ρL/A, volume remains constant."},
    {"id": 15, "question": "The magnetic field at the center of a circular coil of radius r carrying current i is:", "options": {"A": "μ₀i/2r", "B": "μ₀i/r", "C": "μ₀i/4πr", "D": "2μ₀i/r"}, "correct_answer": "A", "hint": "Use Biot-Savart law for circular loop."},
    {"id": 16, "question": "An electromagnetic wave has frequency 3 × 10⁸ Hz. Its wavelength is:", "options": {"A": "1 m", "B": "10 m", "C": "0.1 m", "D": "100 m"}, "correct_answer": "A", "hint": "Use c = νλ, where c = 3 × 10⁸ m/s."},
    {"id": 17, "question": "The refractive index of glass is 1.5. The critical angle for glass-air interface is:", "options": {"A": "30°", "B": "42°", "C": "45°", "D": "60°"}, "correct_answer": "B", "hint": "sin(critical angle) = 1/n."},
    {"id": 18, "question": "In Young's double slit experiment, if the distance between slits is halved, the fringe width:", "options": {"A": "Halved", "B": "Doubled", "C": "Unchanged", "D": "Quadrupled"}, "correct_answer": "B", "hint": "Fringe width β = λD/d."},
    {"id": 19, "question": "The work function of a metal is 4.2 eV. The threshold wavelength is:", "options": {"A": "2950 Å", "B": "3100 Å", "C": "4200 Å", "D": "6200 Å"}, "correct_answer": "A", "hint": "Use E = hc/λ, with hc = 12400 eV·Å."},
    {"id": 20, "question": "In Bohr's model of hydrogen atom, the ratio of kinetic energy to total energy of electron in nth orbit is:", "options": {"A": "1", "B": "-1", "C": "2", "D": "-2"}, "correct_answer": "B", "hint": "KE = -E (total), PE = 2E."},
    {"id": 21, "question": "The half-life of a radioactive substance is 20 days. The time taken for 7/8 of the substance to decay is:", "options": {"A": "40 days", "B": "60 days", "C": "80 days", "D": "100 days"}, "correct_answer": "B", "hint": "After n half-lives, fraction remaining = (1/2)ⁿ."},
    {"id": 22, "question": "In a p-n junction diode, the width of depletion region:", "options": {"A": "Is independent of applied voltage", "B": "Increases under forward bias", "C": "Decreases under reverse bias", "D": "Increases under reverse bias"}, "correct_answer": "D", "hint": "Reverse bias increases the potential barrier."},
    {"id": 23, "question": "The velocity of sound in air at 20°C is 340 m/s. At 40°C, it will be approximately:", "options": {"A": "350 m/s", "B": "352 m/s", "C": "355 m/s", "D": "360 m/s"}, "correct_answer": "B", "hint": "v ∝ √T (absolute temperature)."},
    {"id": 24, "question": "A simple pendulum has time period T. If its length is increased by 44%, the new time period is:", "options": {"A": "1.2T", "B": "1.44T", "C": "0.72T", "D": "2T"}, "correct_answer": "A", "hint": "T ∝ √L."},
    {"id": 25, "question": "The power of a lens is -2D. Its focal length is:", "options": {"A": "+50 cm", "B": "-50 cm", "C": "+2 cm", "D": "-2 cm"}, "correct_answer": "B", "hint": "P = 1/f (in meters)."},
    {"id": 26, "question": "In an LCR series circuit at resonance, the impedance is:", "options": {"A": "Maximum", "B": "Minimum and equal to R", "C": "Zero", "D": "Infinite"}, "correct_answer": "B", "hint": "At resonance, XL = XC, so Z = R."},
    {"id": 27, "question": "The SI unit of magnetic flux is:", "options": {"A": "Tesla", "B": "Weber", "C": "Henry", "D": "Gauss"}, "correct_answer": "B", "hint": "Magnetic flux Φ = B·A."},
    {"id": 28, "question": "A projectile is projected at 45° with horizontal. The range is maximum when:", "options": {"A": "Height is maximum", "B": "Time of flight is minimum", "C": "Angle is 45°", "D": "Velocity is minimum"}, "correct_answer": "C", "hint": "R = u²sin2θ/g is maximum at θ = 45°."},
    {"id": 29, "question": "The dimensional formula of coefficient of viscosity is:", "options": {"A": "[ML⁻¹T⁻¹]", "B": "[MLT⁻¹]", "C": "[ML⁻¹T⁻²]", "D": "[ML²T⁻¹]"}, "correct_answer": "A", "hint": "Use F = ηA(dv/dx)."},
    {"id": 30, "question": "Two bodies of masses m and 4m have equal kinetic energies. The ratio of their momenta is:", "options": {"A": "1:2", "B": "1:4", "C": "2:1", "D": "4:1"}, "correct_answer": "A", "hint": "KE = p²/2m, so p ∝ √m for equal KE."}
]

# SECTION 2: CHEMISTRY (30 Questions)
CHEMISTRY_QUESTIONS = [
    {"id": 1, "question": "Which of the following molecules has the highest dipole moment?", "options": {"A": "NH₃", "B": "NF₃", "C": "CO₂", "D": "BF₃"}, "correct_answer": "A", "hint": "Consider electronegativity difference and molecular geometry."},
    {"id": 2, "question": "The correct order of acidic strength is:", "options": {"A": "HClO₄ > HClO₃ > HClO₂ > HClO", "B": "HClO > HClO₂ > HClO₃ > HClO₄", "C": "HClO₂ > HClO₃ > HClO₄ > HClO", "D": "HClO₃ > HClO₄ > HClO > HClO₂"}, "correct_answer": "A", "hint": "Acidic strength increases with oxygen atoms in oxyacids."},
    {"id": 3, "question": "The hybridization of carbon in CO₂ is:", "options": {"A": "sp", "B": "sp²", "C": "sp³", "D": "sp³d"}, "correct_answer": "A", "hint": "CO₂ has linear geometry with two double bonds."},
    {"id": 4, "question": "Which compound shows optical isomerism?", "options": {"A": "2-butanol", "B": "1-propanol", "C": "2-propanol", "D": "Methanol"}, "correct_answer": "A", "hint": "Optical isomerism requires a chiral center."},
    {"id": 5, "question": "The IUPAC name of CH₃-CH=CH-CHO is:", "options": {"A": "But-2-enal", "B": "But-3-enal", "C": "Crotonaldehyde", "D": "Butanal"}, "correct_answer": "A", "hint": "Aldehyde group gets priority in numbering."},
    {"id": 6, "question": "Which quantum number determines the shape of an orbital?", "options": {"A": "Principal (n)", "B": "Azimuthal (l)", "C": "Magnetic (m)", "D": "Spin (s)"}, "correct_answer": "B", "hint": "l = 0,1,2,3 corresponds to s,p,d,f orbitals."},
    {"id": 7, "question": "The bond angle in NH₃ is approximately:", "options": {"A": "109.5°", "B": "107°", "C": "104.5°", "D": "120°"}, "correct_answer": "B", "hint": "Lone pair causes bond angle compression."},
    {"id": 8, "question": "Which is a Lewis acid?", "options": {"A": "NH₃", "B": "BF₃", "C": "H₂O", "D": "OH⁻"}, "correct_answer": "B", "hint": "Lewis acid accepts electron pair."},
    {"id": 9, "question": "Number of sigma and pi bonds in C₂H₂ are:", "options": {"A": "3 and 2", "B": "2 and 3", "C": "4 and 1", "D": "2 and 2"}, "correct_answer": "A", "hint": "Triple bond = 1σ + 2π."},
    {"id": 10, "question": "Nucleophilic substitution example:", "options": {"A": "Friedel-Crafts alkylation", "B": "Wurtz reaction", "C": "Hydrolysis of alkyl halides", "D": "Nitration of benzene"}, "correct_answer": "C", "hint": "OH⁻ acts as nucleophile."},
    {"id": 11, "question": "The oxidation state of Mn in KMnO₄ is:", "options": {"A": "+2", "B": "+4", "C": "+6", "D": "+7"}, "correct_answer": "D", "hint": "Sum of oxidation states equals zero."},
    {"id": 12, "question": "Which has the highest ionization energy?", "options": {"A": "Na", "B": "Mg", "C": "Al", "D": "Si"}, "correct_answer": "B", "hint": "Mg has stable 3s² configuration."},
    {"id": 13, "question": "The number of unpaired electrons in Fe²⁺ is:", "options": {"A": "2", "B": "3", "C": "4", "D": "5"}, "correct_answer": "C", "hint": "Fe²⁺ has 3d⁶ configuration."},
    {"id": 14, "question": "Benzene undergoes:", "options": {"A": "Addition reactions", "B": "Substitution reactions", "C": "Elimination reactions", "D": "Rearrangement reactions"}, "correct_answer": "B", "hint": "Benzene prefers substitution to preserve aromaticity."},
    {"id": 15, "question": "The pH of 0.001 M HCl solution is:", "options": {"A": "1", "B": "2", "C": "3", "D": "4"}, "correct_answer": "C", "hint": "pH = -log[H⁺]."},
    {"id": 16, "question": "Which is the strongest reducing agent?", "options": {"A": "Li", "B": "Na", "C": "K", "D": "Cs"}, "correct_answer": "A", "hint": "Li has highest reduction potential."},
    {"id": 17, "question": "The geometry of XeF₄ is:", "options": {"A": "Tetrahedral", "B": "Square planar", "C": "See-saw", "D": "Trigonal bipyramidal"}, "correct_answer": "B", "hint": "XeF₄ has sp³d² hybridization."},
    {"id": 18, "question": "Which is most acidic?", "options": {"A": "Phenol", "B": "Ethanol", "C": "Water", "D": "p-nitrophenol"}, "correct_answer": "D", "hint": "Electron withdrawing groups increase acidity."},
    {"id": 19, "question": "The coordination number of Na⁺ in NaCl crystal is:", "options": {"A": "4", "B": "6", "C": "8", "D": "12"}, "correct_answer": "B", "hint": "NaCl has rock salt structure."},
    {"id": 20, "question": "Grignard reagent reacts with:", "options": {"A": "Water", "B": "Alcohol", "C": "Carbonyl compounds", "D": "All of these"}, "correct_answer": "D", "hint": "Grignard reagent is highly reactive."},
    {"id": 21, "question": "The catalyst used in Haber's process is:", "options": {"A": "Pt", "B": "Fe", "C": "Ni", "D": "V₂O₅"}, "correct_answer": "B", "hint": "Fe with promoters is used for ammonia synthesis."},
    {"id": 22, "question": "Which has the largest atomic radius?", "options": {"A": "Na", "B": "Mg", "C": "Al", "D": "K"}, "correct_answer": "D", "hint": "Atomic radius increases down a group."},
    {"id": 23, "question": "The number of isomers of C₄H₁₀ is:", "options": {"A": "1", "B": "2", "C": "3", "D": "4"}, "correct_answer": "B", "hint": "n-butane and isobutane."},
    {"id": 24, "question": "Which metal does not react with dilute HCl?", "options": {"A": "Zn", "B": "Fe", "C": "Cu", "D": "Mg"}, "correct_answer": "C", "hint": "Cu is below H in reactivity series."},
    {"id": 25, "question": "The molecular geometry of SF₆ is:", "options": {"A": "Tetrahedral", "B": "Octahedral", "C": "Trigonal bipyramidal", "D": "Square pyramidal"}, "correct_answer": "B", "hint": "SF₆ has sp³d² hybridization with 6 bond pairs."},
    {"id": 26, "question": "Which is a biodegradable polymer?", "options": {"A": "PVC", "B": "Polythene", "C": "PHBV", "D": "Teflon"}, "correct_answer": "C", "hint": "PHBV is poly-β-hydroxybutyrate-co-β-hydroxyvalerate."},
    {"id": 27, "question": "The ore of aluminium is:", "options": {"A": "Haematite", "B": "Bauxite", "C": "Galena", "D": "Calamine"}, "correct_answer": "B", "hint": "Bauxite is Al₂O₃·2H₂O."},
    {"id": 28, "question": "Which gives positive iodoform test?", "options": {"A": "Methanol", "B": "Ethanol", "C": "1-propanol", "D": "2-methyl-2-propanol"}, "correct_answer": "B", "hint": "Compounds with CH₃CO- or CH₃CHOH- give iodoform test."},
    {"id": 29, "question": "The enthalpy of formation of water is:", "options": {"A": "Positive", "B": "Negative", "C": "Zero", "D": "Cannot be determined"}, "correct_answer": "B", "hint": "Formation of water is exothermic."},
    {"id": 30, "question": "Which is used as antifreeze?", "options": {"A": "Methanol", "B": "Ethylene glycol", "C": "Glycerol", "D": "Ethanol"}, "correct_answer": "B", "hint": "Ethylene glycol lowers freezing point of water."}
]

# SECTION 3A: ENGLISH PROFICIENCY (10 Questions)
ENGLISH_QUESTIONS = [
    {"id": 1, "question": "Select the word most similar in meaning to: ABRIDGE", "options": {"A": "Extend", "B": "Shorten", "C": "Bridge", "D": "Cross"}, "correct_answer": "B", "hint": "Abridge means to condense or shorten."},
    {"id": 2, "question": "Select the word most similar in meaning to: BENEVOLENT", "options": {"A": "Malicious", "B": "Kind", "C": "Indifferent", "D": "Hostile"}, "correct_answer": "B", "hint": "Benevolent relates to kindness and goodwill."},
    {"id": 3, "question": "Select the word opposite in meaning to: OPAQUE", "options": {"A": "Dark", "B": "Transparent", "C": "Cloudy", "D": "Dim"}, "correct_answer": "B", "hint": "Opaque means not allowing light to pass through."},
    {"id": 4, "question": "Select the word opposite in meaning to: VERBOSE", "options": {"A": "Wordy", "B": "Lengthy", "C": "Concise", "D": "Elaborate"}, "correct_answer": "C", "hint": "Verbose means using more words than needed."},
    {"id": 5, "question": "Choose the correct sentence:", "options": {"A": "He is more taller than me", "B": "He is taller than me", "C": "He is most tall than me", "D": "He is tallest than me"}, "correct_answer": "B", "hint": "Comparative degree doesn't use 'more' with -er form."},
    {"id": 6, "question": "Fill in the blank: She has been working here ___ 2015.", "options": {"A": "from", "B": "since", "C": "for", "D": "by"}, "correct_answer": "B", "hint": "'Since' is used with a point in time."},
    {"id": 7, "question": "Choose the correct spelling:", "options": {"A": "Accomodation", "B": "Accommodation", "C": "Acomodation", "D": "Acommodation"}, "correct_answer": "B", "hint": "Double 'c' and double 'm'."},
    {"id": 8, "question": "The idiom 'A piece of cake' means:", "options": {"A": "A difficult task", "B": "An easy task", "C": "A sweet dish", "D": "A celebration"}, "correct_answer": "B", "hint": "This idiom refers to something very easy."},
    {"id": 9, "question": "Select the word most similar in meaning to: METICULOUS", "options": {"A": "Careless", "B": "Careful", "C": "Reckless", "D": "Negligent"}, "correct_answer": "B", "hint": "Meticulous means showing great attention to detail."},
    {"id": 10, "question": "Fill in the blank: Neither he ___ his friends were present.", "options": {"A": "or", "B": "nor", "C": "and", "D": "but"}, "correct_answer": "B", "hint": "'Neither' is always paired with 'nor'."}
]

# SECTION 3B: LOGICAL REASONING (20 Questions)
LOGICAL_REASONING_QUESTIONS = [
    {"id": 1, "question": "Find the missing number: 7, 12, 19, 28, 39, ?", "options": {"A": "52", "B": "49", "C": "54", "D": "51"}, "correct_answer": "A", "hint": "Differences are 5, 7, 9, 11, 13..."},
    {"id": 2, "question": "Find the missing number: 2, 6, 12, 20, 30, ?", "options": {"A": "40", "B": "42", "C": "44", "D": "46"}, "correct_answer": "B", "hint": "Differences are 4, 6, 8, 10, 12..."},
    {"id": 3, "question": "If APPLE is coded as ELPPA, then MANGO is coded as:", "options": {"A": "OGNAM", "B": "MANGP", "C": "OBNAM", "D": "GONMA"}, "correct_answer": "A", "hint": "The word is reversed."},
    {"id": 4, "question": "Find the odd one out: 8, 27, 64, 100, 125", "options": {"A": "8", "B": "27", "C": "100", "D": "125"}, "correct_answer": "C", "hint": "All except one are perfect cubes."},
    {"id": 5, "question": "A is B's brother. C is A's mother. D is C's father. How is B related to D?", "options": {"A": "Grandfather", "B": "Grandson", "C": "Grandmother", "D": "Son"}, "correct_answer": "B", "hint": "Draw a family tree."},
    {"id": 6, "question": "If 5 + 3 = 28, 9 + 1 = 810, then 2 + 6 = ?", "options": {"A": "48", "B": "26", "C": "46", "D": "28"}, "correct_answer": "A", "hint": "Pattern: (difference)(sum) or similar."},
    {"id": 7, "question": "Complete the series: AZ, BY, CX, DW, ?", "options": {"A": "EU", "B": "EV", "C": "FV", "D": "EX"}, "correct_answer": "B", "hint": "First letter increases, second decreases."},
    {"id": 8, "question": "Find the missing number: 3, 9, 27, 81, ?", "options": {"A": "162", "B": "243", "C": "324", "D": "729"}, "correct_answer": "B", "hint": "Each term is multiplied by 3."},
    {"id": 9, "question": "If CAT = 24, DOG = 26, then BAT = ?", "options": {"A": "22", "B": "23", "C": "24", "D": "25"}, "correct_answer": "B", "hint": "Sum of letter positions: C=3, A=1, T=20."},
    {"id": 10, "question": "Find the next: 1, 1, 2, 3, 5, 8, 13, ?", "options": {"A": "18", "B": "20", "C": "21", "D": "26"}, "correct_answer": "C", "hint": "Fibonacci sequence: each term = sum of previous two."},
    {"id": 11, "question": "If Monday = 1, Tuesday = 2... then Friday + Saturday = ?", "options": {"A": "10", "B": "11", "C": "12", "D": "13"}, "correct_answer": "B", "hint": "Friday = 5, Saturday = 6."},
    {"id": 12, "question": "Complete: 2, 5, 10, 17, 26, ?", "options": {"A": "35", "B": "37", "C": "39", "D": "41"}, "correct_answer": "B", "hint": "Differences are 3, 5, 7, 9, 11..."},
    {"id": 13, "question": "CHAIR is to SIT as BED is to:", "options": {"A": "Stand", "B": "Sleep", "C": "Room", "D": "Furniture"}, "correct_answer": "B", "hint": "Function relationship."},
    {"id": 14, "question": "If ROAD = 51 and PATH = 50, then LANE = ?", "options": {"A": "30", "B": "32", "C": "36", "D": "40"}, "correct_answer": "C", "hint": "Sum of positions: L=12, A=1, N=14, E=5."},
    {"id": 15, "question": "Pointing to a man, a woman said 'His mother is the only daughter of my mother.' How is the woman related to the man?", "options": {"A": "Mother", "B": "Daughter", "C": "Sister", "D": "Grandmother"}, "correct_answer": "A", "hint": "Only daughter of my mother = myself."},
    {"id": 16, "question": "Find the odd one: January, March, May, June, July", "options": {"A": "January", "B": "March", "C": "June", "D": "July"}, "correct_answer": "C", "hint": "All except one have 31 days."},
    {"id": 17, "question": "Complete: Z, X, V, T, R, ?", "options": {"A": "O", "B": "P", "C": "Q", "D": "N"}, "correct_answer": "B", "hint": "Alternate letters going backwards."},
    {"id": 18, "question": "What comes next: 1, 4, 9, 16, 25, ?", "options": {"A": "30", "B": "35", "C": "36", "D": "49"}, "correct_answer": "C", "hint": "Perfect squares: 1², 2², 3², 4², 5², 6²."},
    {"id": 19, "question": "If in a certain code, PALE is coded as 2134, LEAP is coded as:", "options": {"A": "4312", "B": "3214", "C": "3142", "D": "4321"}, "correct_answer": "C", "hint": "P=2, A=1, L=3, E=4."},
    {"id": 20, "question": "A clock shows 3:15. What is the angle between the hour and minute hands?", "options": {"A": "0°", "B": "7.5°", "C": "15°", "D": "22.5°"}, "correct_answer": "B", "hint": "Hour hand moves 0.5° per minute from the hour mark."}
]

# SECTION 4: MATHEMATICS (40 Questions)
MATHEMATICS_QUESTIONS = [
    {"id": 1, "question": "If ω is an imaginary cube root of unity, what is the value of (1+ω−ω²)⁷?", "options": {"A": "−128ω", "B": "128ω²", "C": "−128ω²", "D": "128ω"}, "correct_answer": "C", "hint": "Use properties of cube roots of unity: 1+ω+ω²=0."},
    {"id": 2, "question": "The value of lim(x→0) (sin x)/x is:", "options": {"A": "0", "B": "1", "C": "∞", "D": "Does not exist"}, "correct_answer": "B", "hint": "Standard limit."},
    {"id": 3, "question": "The derivative of e^(sin x) is:", "options": {"A": "e^(sin x)", "B": "cos x · e^(sin x)", "C": "sin x · e^(cos x)", "D": "e^(cos x)"}, "correct_answer": "B", "hint": "Use chain rule."},
    {"id": 4, "question": "∫ 1/(1+x²) dx equals:", "options": {"A": "tan⁻¹x + C", "B": "sin⁻¹x + C", "C": "log(1+x²) + C", "D": "sec⁻¹x + C"}, "correct_answer": "A", "hint": "Standard integral formula."},
    {"id": 5, "question": "The area bounded by y = x² and y = x is:", "options": {"A": "1/6", "B": "1/3", "C": "1/2", "D": "1"}, "correct_answer": "A", "hint": "Find intersection points and integrate."},
    {"id": 6, "question": "If A = {1, 2, 3, 4} and B = {3, 4, 5, 6}, then A ∩ B is:", "options": {"A": "{1, 2}", "B": "{3, 4}", "C": "{5, 6}", "D": "{1, 2, 3, 4, 5, 6}"}, "correct_answer": "B", "hint": "Intersection contains common elements."},
    {"id": 7, "question": "The sum of first n natural numbers is:", "options": {"A": "n(n+1)/2", "B": "n(n-1)/2", "C": "n²", "D": "n(n+1)"}, "correct_answer": "A", "hint": "Arithmetic progression sum formula."},
    {"id": 8, "question": "The value of ¹⁰C₃ is:", "options": {"A": "120", "B": "720", "C": "100", "D": "90"}, "correct_answer": "A", "hint": "ⁿCᵣ = n!/(r!(n-r)!)."},
    {"id": 9, "question": "If |a + ib| = 5 and a = 3, then b = ?", "options": {"A": "2", "B": "4", "C": "±4", "D": "±2"}, "correct_answer": "C", "hint": "|a + ib| = √(a² + b²)."},
    {"id": 10, "question": "The equation x² + y² - 4x + 6y + 9 = 0 represents:", "options": {"A": "Circle", "B": "Point", "C": "No curve", "D": "Pair of lines"}, "correct_answer": "A", "hint": "Complete the square."},
    {"id": 11, "question": "The slope of line 3x + 4y = 12 is:", "options": {"A": "3/4", "B": "-3/4", "C": "4/3", "D": "-4/3"}, "correct_answer": "B", "hint": "Convert to y = mx + c form."},
    {"id": 12, "question": "The value of cos 60° is:", "options": {"A": "1/2", "B": "√3/2", "C": "1/√2", "D": "1"}, "correct_answer": "A", "hint": "Standard trigonometric value."},
    {"id": 13, "question": "sin²θ + cos²θ equals:", "options": {"A": "0", "B": "1", "C": "2", "D": "tan²θ"}, "correct_answer": "B", "hint": "Pythagorean identity."},
    {"id": 14, "question": "The general solution of sin x = 0 is:", "options": {"A": "nπ", "B": "2nπ", "C": "(2n+1)π/2", "D": "nπ/2"}, "correct_answer": "A", "hint": "sin x = 0 at x = 0, π, 2π, ..."},
    {"id": 15, "question": "The rank of matrix [1 2; 2 4] is:", "options": {"A": "0", "B": "1", "C": "2", "D": "3"}, "correct_answer": "B", "hint": "Second row is multiple of first."},
    {"id": 16, "question": "If A is a 3×3 matrix and |A| = 5, then |2A| = ?", "options": {"A": "10", "B": "20", "C": "40", "D": "80"}, "correct_answer": "C", "hint": "|kA| = kⁿ|A| for n×n matrix."},
    {"id": 17, "question": "The probability of getting a head in a coin toss is:", "options": {"A": "0", "B": "1/4", "C": "1/2", "D": "1"}, "correct_answer": "C", "hint": "P = favorable/total outcomes."},
    {"id": 18, "question": "Mean of 2, 4, 6, 8, 10 is:", "options": {"A": "4", "B": "5", "C": "6", "D": "7"}, "correct_answer": "C", "hint": "Mean = sum/count."},
    {"id": 19, "question": "The quadratic equation x² - 5x + 6 = 0 has roots:", "options": {"A": "2 and 3", "B": "1 and 6", "C": "-2 and -3", "D": "2 and -3"}, "correct_answer": "A", "hint": "Factor or use quadratic formula."},
    {"id": 20, "question": "log₁₀ 100 equals:", "options": {"A": "1", "B": "2", "C": "10", "D": "100"}, "correct_answer": "B", "hint": "10² = 100."},
    {"id": 21, "question": "The vector a = 3î + 4ĵ has magnitude:", "options": {"A": "3", "B": "4", "C": "5", "D": "7"}, "correct_answer": "C", "hint": "|a| = √(3² + 4²)."},
    {"id": 22, "question": "The angle between vectors î and ĵ is:", "options": {"A": "0°", "B": "45°", "C": "90°", "D": "180°"}, "correct_answer": "C", "hint": "Unit vectors along axes are perpendicular."},
    {"id": 23, "question": "The eccentricity of a circle is:", "options": {"A": "0", "B": "1", "C": "Greater than 1", "D": "Less than 1"}, "correct_answer": "A", "hint": "Circle is a special case of ellipse."},
    {"id": 24, "question": "d/dx (log x) equals:", "options": {"A": "1/x", "B": "x", "C": "log x", "D": "eˣ"}, "correct_answer": "A", "hint": "Standard derivative formula."},
    {"id": 25, "question": "∫ eˣ dx equals:", "options": {"A": "eˣ", "B": "eˣ + C", "C": "xeˣ + C", "D": "eˣ/x + C"}, "correct_answer": "B", "hint": "Integral of eˣ is eˣ."},
    {"id": 26, "question": "The number of permutations of 4 objects taken 2 at a time is:", "options": {"A": "6", "B": "8", "C": "12", "D": "24"}, "correct_answer": "C", "hint": "P(4,2) = 4!/(4-2)!."},
    {"id": 27, "question": "If f(x) = x³, then f'(2) = ?", "options": {"A": "6", "B": "8", "C": "12", "D": "24"}, "correct_answer": "C", "hint": "f'(x) = 3x², substitute x = 2."},
    {"id": 28, "question": "The distance between points (1,2) and (4,6) is:", "options": {"A": "3", "B": "4", "C": "5", "D": "7"}, "correct_answer": "C", "hint": "Use distance formula."},
    {"id": 29, "question": "The value of tan 45° is:", "options": {"A": "0", "B": "1", "C": "√3", "D": "1/√3"}, "correct_answer": "B", "hint": "tan 45° = sin 45°/cos 45°."},
    {"id": 30, "question": "The solution of dy/dx = y is:", "options": {"A": "y = Ceˣ", "B": "y = Cx", "C": "y = Ce⁻ˣ", "D": "y = C/x"}, "correct_answer": "A", "hint": "Separate variables and integrate."},
    {"id": 31, "question": "If the roots of x² + px + q = 0 are equal, then:", "options": {"A": "p² = 4q", "B": "p² = q", "C": "p = 4q²", "D": "p = q²"}, "correct_answer": "A", "hint": "For equal roots, discriminant = 0."},
    {"id": 32, "question": "The value of sin 30° + cos 60° is:", "options": {"A": "0", "B": "1", "C": "1/2", "D": "√3/2"}, "correct_answer": "B", "hint": "sin 30° = cos 60° = 1/2."},
    {"id": 33, "question": "If A and B are mutually exclusive events, then P(A∩B) = ?", "options": {"A": "P(A) + P(B)", "B": "P(A) × P(B)", "C": "0", "D": "1"}, "correct_answer": "C", "hint": "Mutually exclusive means no common outcomes."},
    {"id": 34, "question": "The inverse of matrix [1 0; 0 1] is:", "options": {"A": "[1 0; 0 1]", "B": "[0 1; 1 0]", "C": "[-1 0; 0 -1]", "D": "Does not exist"}, "correct_answer": "A", "hint": "Identity matrix is its own inverse."},
    {"id": 35, "question": "lim(x→∞) (1 + 1/x)ˣ equals:", "options": {"A": "0", "B": "1", "C": "e", "D": "∞"}, "correct_answer": "C", "hint": "Definition of e."},
    {"id": 36, "question": "The equation of a line passing through origin with slope 2 is:", "options": {"A": "y = 2x", "B": "y = x + 2", "C": "y = 2x + 1", "D": "2y = x"}, "correct_answer": "A", "hint": "y = mx + c, where c = 0 for origin."},
    {"id": 37, "question": "The value of ∫₀¹ x² dx is:", "options": {"A": "1/2", "B": "1/3", "C": "1/4", "D": "1"}, "correct_answer": "B", "hint": "∫x² dx = x³/3."},
    {"id": 38, "question": "If sin θ = 3/5, then cos θ = ?", "options": {"A": "3/5", "B": "4/5", "C": "5/4", "D": "5/3"}, "correct_answer": "B", "hint": "Use sin²θ + cos²θ = 1."},
    {"id": 39, "question": "The number of diagonals in a hexagon is:", "options": {"A": "6", "B": "9", "C": "12", "D": "15"}, "correct_answer": "B", "hint": "n(n-3)/2 for n-sided polygon."},
    {"id": 40, "question": "The sum of an infinite GP with first term 1 and common ratio 1/2 is:", "options": {"A": "1", "B": "2", "C": "3", "D": "∞"}, "correct_answer": "B", "hint": "S = a/(1-r) for |r| < 1."}
]

# ============== SKILL TEST QUESTIONS ==============

# SECTION: APTITUDE (20 Questions)
APTITUDE_QUESTIONS = [
    {"id": 1, "question": "If a train travels 360 km in 4 hours, what is its speed?", "options": {"A": "80 km/hr", "B": "90 km/hr", "C": "100 km/hr", "D": "70 km/hr"}, "correct_answer": "B", "hint": "Speed = Distance/Time"},
    {"id": 2, "question": "A man buys an article for ₹500 and sells it for ₹600. What is the profit percentage?", "options": {"A": "10%", "B": "15%", "C": "20%", "D": "25%"}, "correct_answer": "C", "hint": "Profit% = (Profit/CP) × 100"},
    {"id": 3, "question": "If 6 workers can complete a job in 12 days, how many days will 9 workers take?", "options": {"A": "6 days", "B": "8 days", "C": "10 days", "D": "18 days"}, "correct_answer": "B", "hint": "More workers, less days (inverse proportion)"},
    {"id": 4, "question": "The ratio of boys to girls in a class is 3:2. If there are 30 boys, how many girls are there?", "options": {"A": "15", "B": "20", "C": "25", "D": "18"}, "correct_answer": "B", "hint": "Use ratio proportion"},
    {"id": 5, "question": "A sum of money doubles in 5 years at simple interest. The rate of interest is:", "options": {"A": "10%", "B": "15%", "C": "20%", "D": "25%"}, "correct_answer": "C", "hint": "SI = P means rate = 100/time"},
    {"id": 6, "question": "What is 15% of 240?", "options": {"A": "32", "B": "36", "C": "40", "D": "44"}, "correct_answer": "B", "hint": "15/100 × 240"},
    {"id": 7, "question": "If x:y = 2:3 and y:z = 4:5, then x:z = ?", "options": {"A": "8:15", "B": "2:5", "C": "3:5", "D": "4:15"}, "correct_answer": "A", "hint": "Combine ratios through common term"},
    {"id": 8, "question": "A tank can be filled by pipe A in 6 hours and pipe B in 8 hours. How long to fill together?", "options": {"A": "3 hours 26 min", "B": "3 hours", "C": "4 hours", "D": "2 hours 30 min"}, "correct_answer": "A", "hint": "Combined rate = 1/6 + 1/8"},
    {"id": 9, "question": "The average of 5 numbers is 20. If one number is excluded, the average becomes 18. The excluded number is:", "options": {"A": "24", "B": "26", "C": "28", "D": "30"}, "correct_answer": "C", "hint": "Total = 5×20, New total = 4×18"},
    {"id": 10, "question": "A car covers 450 km in 9 hours. What distance will it cover in 5 hours at the same speed?", "options": {"A": "200 km", "B": "225 km", "C": "250 km", "D": "275 km"}, "correct_answer": "C", "hint": "First find speed, then multiply by 5"},
    {"id": 11, "question": "The compound interest on ₹1000 at 10% per annum for 2 years is:", "options": {"A": "₹200", "B": "₹210", "C": "₹220", "D": "₹250"}, "correct_answer": "B", "hint": "CI = P(1+r/100)^n - P"},
    {"id": 12, "question": "If the selling price is ₹720 and loss is 10%, what is the cost price?", "options": {"A": "₹750", "B": "₹800", "C": "₹850", "D": "₹900"}, "correct_answer": "B", "hint": "SP = CP × (100-Loss%)/100"},
    {"id": 13, "question": "A and B can do a work in 10 days and 15 days respectively. In how many days can they complete it together?", "options": {"A": "5 days", "B": "6 days", "C": "7 days", "D": "8 days"}, "correct_answer": "B", "hint": "Combined rate = 1/10 + 1/15"},
    {"id": 14, "question": "The HCF of 36 and 48 is:", "options": {"A": "6", "B": "12", "C": "18", "D": "24"}, "correct_answer": "B", "hint": "Find common factors"},
    {"id": 15, "question": "A boat travels 20 km upstream in 4 hours. If the speed of stream is 2 km/hr, find the speed of boat in still water.", "options": {"A": "5 km/hr", "B": "7 km/hr", "C": "9 km/hr", "D": "11 km/hr"}, "correct_answer": "B", "hint": "Upstream speed = Boat speed - Stream speed"},
    {"id": 16, "question": "If 40% of a number is 80, what is the number?", "options": {"A": "180", "B": "200", "C": "220", "D": "240"}, "correct_answer": "B", "hint": "Number = 80 × 100/40"},
    {"id": 17, "question": "The LCM of 12, 15 and 20 is:", "options": {"A": "40", "B": "50", "C": "60", "D": "80"}, "correct_answer": "C", "hint": "Find smallest common multiple"},
    {"id": 18, "question": "A shopkeeper marks an article 25% above CP and gives 10% discount. His profit is:", "options": {"A": "12.5%", "B": "15%", "C": "17.5%", "D": "20%"}, "correct_answer": "A", "hint": "Final SP = 1.25 × 0.9 × CP"},
    {"id": 19, "question": "The sum of ages of father and son is 50 years. Five years ago, father was 4 times the son's age. Find father's present age.", "options": {"A": "35 years", "B": "38 years", "C": "40 years", "D": "42 years"}, "correct_answer": "C", "hint": "Form equations and solve"},
    {"id": 20, "question": "A mixture contains milk and water in ratio 5:3. If 4 liters of water is added, ratio becomes 5:4. Find initial quantity of milk.", "options": {"A": "15 liters", "B": "20 liters", "C": "25 liters", "D": "30 liters"}, "correct_answer": "B", "hint": "Let milk = 5x, water = 3x, then 5x/(3x+4) = 5/4"}
]

# SECTION: REASONING (15 Questions)
REASONING_QUESTIONS = [
    {"id": 1, "question": "Find the next number: 2, 6, 12, 20, 30, ?", "options": {"A": "40", "B": "42", "C": "44", "D": "46"}, "correct_answer": "B", "hint": "Differences: 4, 6, 8, 10, 12..."},
    {"id": 2, "question": "If COMPUTER is coded as RFUVQNPC, then PRINTER is coded as:", "options": {"A": "QSJOUFS", "B": "QSJOUFQ", "C": "OQHOUFS", "D": "SFUOQJS"}, "correct_answer": "A", "hint": "Each letter +1"},
    {"id": 3, "question": "Find the odd one: Apple, Mango, Potato, Orange", "options": {"A": "Apple", "B": "Mango", "C": "Potato", "D": "Orange"}, "correct_answer": "C", "hint": "One is not a fruit"},
    {"id": 4, "question": "If South-East becomes North, then North-East becomes:", "options": {"A": "South", "B": "West", "C": "South-West", "D": "North-West"}, "correct_answer": "C", "hint": "Rotate 135° clockwise"},
    {"id": 5, "question": "Complete the series: A, D, G, J, ?", "options": {"A": "L", "B": "M", "C": "N", "D": "K"}, "correct_answer": "B", "hint": "Skip 2 letters each time"},
    {"id": 6, "question": "In a row of students, Raj is 12th from left and 18th from right. Total students in row?", "options": {"A": "28", "B": "29", "C": "30", "D": "31"}, "correct_answer": "B", "hint": "Total = Left + Right - 1"},
    {"id": 7, "question": "If × means +, + means ÷, - means ×, ÷ means -, then 8 × 7 - 8 + 40 ÷ 2 = ?", "options": {"A": "8", "B": "9.4", "C": "10", "D": "7.4"}, "correct_answer": "D", "hint": "Replace symbols and calculate"},
    {"id": 8, "question": "Pointing to a photograph, a man said 'She is the daughter of my grandfather's only son.' How is the girl related to the man?", "options": {"A": "Daughter", "B": "Sister", "C": "Mother", "D": "Aunt"}, "correct_answer": "B", "hint": "Grandfather's only son = Father"},
    {"id": 9, "question": "Find missing: 1, 8, 27, 64, ?", "options": {"A": "100", "B": "125", "C": "144", "D": "169"}, "correct_answer": "B", "hint": "Cubes: 1³, 2³, 3³, 4³, 5³"},
    {"id": 10, "question": "If PALE is coded as 2134 and LEAP is coded as 3412, what is PLEA?", "options": {"A": "2341", "B": "2143", "C": "2314", "D": "2413"}, "correct_answer": "C", "hint": "P=2, L=3, E=1, A=4"},
    {"id": 11, "question": "Which figure completes the pattern? □, △, □, △, □, ?", "options": {"A": "□", "B": "△", "C": "○", "D": "◇"}, "correct_answer": "B", "hint": "Alternating pattern"},
    {"id": 12, "question": "A is father of B. C is brother of A. D is son of C. How is D related to B?", "options": {"A": "Brother", "B": "Cousin", "C": "Uncle", "D": "Nephew"}, "correct_answer": "B", "hint": "D is son of B's uncle"},
    {"id": 13, "question": "Find the odd one: 121, 144, 169, __(odd)__, 225", "options": {"A": "196", "B": "190", "C": "195", "D": "198"}, "correct_answer": "B", "hint": "All others are perfect squares"},
    {"id": 14, "question": "If 'pen' is called 'eraser', 'eraser' is called 'book', 'book' is called 'pencil', what do you write with?", "options": {"A": "Eraser", "B": "Book", "C": "Pencil", "D": "Pen"}, "correct_answer": "A", "hint": "Pen is called eraser"},
    {"id": 15, "question": "What comes next: Z, Y, X, W, V, ?", "options": {"A": "S", "B": "T", "C": "U", "D": "R"}, "correct_answer": "C", "hint": "Reverse alphabet sequence"}
]

# SECTION: VERBAL ABILITY (15 Questions)
VERBAL_QUESTIONS = [
    {"id": 1, "question": "Choose the synonym of 'ABUNDANT':", "options": {"A": "Scarce", "B": "Plentiful", "C": "Rare", "D": "Limited"}, "correct_answer": "B", "hint": "Abundant means existing in large quantities"},
    {"id": 2, "question": "Choose the antonym of 'VAGUE':", "options": {"A": "Unclear", "B": "Ambiguous", "C": "Precise", "D": "Hazy"}, "correct_answer": "C", "hint": "Vague means unclear or undefined"},
    {"id": 3, "question": "Fill in the blank: He has been working ___ morning.", "options": {"A": "from", "B": "since", "C": "for", "D": "by"}, "correct_answer": "B", "hint": "'Since' is used with point of time"},
    {"id": 4, "question": "Choose the correct spelling:", "options": {"A": "Occurence", "B": "Occurance", "C": "Occurrence", "D": "Occurrance"}, "correct_answer": "C", "hint": "Double 'c' and double 'r'"},
    {"id": 5, "question": "The idiom 'Break the ice' means:", "options": {"A": "To damage something", "B": "To start a conversation", "C": "To freeze", "D": "To end relationship"}, "correct_answer": "B", "hint": "To initiate social interaction"},
    {"id": 6, "question": "Choose the synonym of 'ELOQUENT':", "options": {"A": "Silent", "B": "Articulate", "C": "Quiet", "D": "Reserved"}, "correct_answer": "B", "hint": "Eloquent means fluent or persuasive"},
    {"id": 7, "question": "Fill in the blank: Neither the students ___ the teacher was present.", "options": {"A": "or", "B": "nor", "C": "and", "D": "but"}, "correct_answer": "B", "hint": "'Neither' is paired with 'nor'"},
    {"id": 8, "question": "Choose the antonym of 'OPTIMISTIC':", "options": {"A": "Hopeful", "B": "Positive", "C": "Pessimistic", "D": "Cheerful"}, "correct_answer": "C", "hint": "Opposite of hopeful/positive outlook"},
    {"id": 9, "question": "The phrase 'A blessing in disguise' means:", "options": {"A": "A hidden curse", "B": "Something good that seemed bad at first", "C": "A beautiful dress", "D": "A religious blessing"}, "correct_answer": "B", "hint": "An apparent misfortune that results in good"},
    {"id": 10, "question": "Choose the correct sentence:", "options": {"A": "He is more taller than me", "B": "He is tallest than me", "C": "He is taller than I", "D": "He is most tall than me"}, "correct_answer": "C", "hint": "Comparative doesn't use 'more' with '-er'"},
    {"id": 11, "question": "Choose the synonym of 'DILIGENT':", "options": {"A": "Lazy", "B": "Careless", "C": "Hardworking", "D": "Negligent"}, "correct_answer": "C", "hint": "Diligent means showing care and effort"},
    {"id": 12, "question": "Fill in the blank: The book ___ on the table since morning.", "options": {"A": "is lying", "B": "has been lying", "C": "was lying", "D": "had lying"}, "correct_answer": "B", "hint": "Present perfect continuous for ongoing action"},
    {"id": 13, "question": "Choose the antonym of 'TRIVIAL':", "options": {"A": "Unimportant", "B": "Minor", "C": "Significant", "D": "Petty"}, "correct_answer": "C", "hint": "Trivial means of little importance"},
    {"id": 14, "question": "The idiom 'Cost an arm and a leg' means:", "options": {"A": "Very cheap", "B": "Very expensive", "C": "Medical expense", "D": "Physical injury"}, "correct_answer": "B", "hint": "Something that is very costly"},
    {"id": 15, "question": "Choose the correct word: The ___ of the team was high after the victory.", "options": {"A": "moral", "B": "morale", "C": "morality", "D": "morals"}, "correct_answer": "B", "hint": "Morale refers to confidence/enthusiasm of a group"}
]

# Define Models
class QuizQuestion(BaseModel):
    id: int
    question: str
    options: dict
    hint: str

class QuizAnswer(BaseModel):
    question_id: int
    section: str
    selected_answer: Optional[str]

class SectionResult(BaseModel):
    section_name: str
    total_questions: int
    attempted: int
    correct: int
    wrong: int
    marks: float

class QuizResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sections: List[SectionResult]
    total_marks: float
    max_marks: float
    percentage: float
    time_taken: int
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SubmitQuizRequest(BaseModel):
    answers: List[QuizAnswer]
    time_taken: int


# Routes
@api_router.get("/")
async def root():
    return {"message": "BITSAT Mock Test API - Edu9 Career Guidance"}

@api_router.get("/quiz/sections")
async def get_sections():
    return {
        "sections": [
            {"id": "physics", "name": "Physics", "questions": 30, "marks_per_question": 3, "negative_marking": -1},
            {"id": "chemistry", "name": "Chemistry", "questions": 30, "marks_per_question": 3, "negative_marking": -1},
            {"id": "english", "name": "English Proficiency", "questions": 10, "marks_per_question": 3, "negative_marking": -1},
            {"id": "logical", "name": "Logical Reasoning", "questions": 20, "marks_per_question": 3, "negative_marking": -1},
            {"id": "mathematics", "name": "Mathematics", "questions": 40, "marks_per_question": 3, "negative_marking": -1}
        ],
        "total_questions": 130,
        "max_marks": 390,
        "duration_minutes": 180
    }

@api_router.get("/quiz/questions/{section}")
async def get_section_questions(section: str):
    questions_map = {
        "physics": PHYSICS_QUESTIONS,
        "chemistry": CHEMISTRY_QUESTIONS,
        "english": ENGLISH_QUESTIONS,
        "logical": LOGICAL_REASONING_QUESTIONS,
        "mathematics": MATHEMATICS_QUESTIONS
    }
    
    if section not in questions_map:
        return {"error": "Section not found"}
    
    questions = questions_map[section]
    return [QuizQuestion(id=q["id"], question=q["question"], options=q["options"], hint=q["hint"]) for q in questions]

@api_router.get("/quiz/all-questions")
async def get_all_questions():
    return {
        "physics": [QuizQuestion(id=q["id"], question=q["question"], options=q["options"], hint=q["hint"]) for q in PHYSICS_QUESTIONS],
        "chemistry": [QuizQuestion(id=q["id"], question=q["question"], options=q["options"], hint=q["hint"]) for q in CHEMISTRY_QUESTIONS],
        "english": [QuizQuestion(id=q["id"], question=q["question"], options=q["options"], hint=q["hint"]) for q in ENGLISH_QUESTIONS],
        "logical": [QuizQuestion(id=q["id"], question=q["question"], options=q["options"], hint=q["hint"]) for q in LOGICAL_REASONING_QUESTIONS],
        "mathematics": [QuizQuestion(id=q["id"], question=q["question"], options=q["options"], hint=q["hint"]) for q in MATHEMATICS_QUESTIONS]
    }

@api_router.post("/quiz/submit")
async def submit_quiz(request: SubmitQuizRequest):
    questions_map = {
        "physics": PHYSICS_QUESTIONS,
        "chemistry": CHEMISTRY_QUESTIONS,
        "english": ENGLISH_QUESTIONS,
        "logical": LOGICAL_REASONING_QUESTIONS,
        "mathematics": MATHEMATICS_QUESTIONS
    }
    
    section_results = []
    total_marks = 0
    
    for section_id, questions in questions_map.items():
        section_answers = [a for a in request.answers if a.section == section_id]
        
        attempted = 0
        correct = 0
        wrong = 0
        
        for q in questions:
            answer = next((a for a in section_answers if a.question_id == q["id"]), None)
            if answer and answer.selected_answer:
                attempted += 1
                if answer.selected_answer == q["correct_answer"]:
                    correct += 1
                else:
                    wrong += 1
        
        section_marks = (correct * 3) + (wrong * -1)
        total_marks += section_marks
        
        section_name = {
            "physics": "Physics",
            "chemistry": "Chemistry", 
            "english": "English Proficiency",
            "logical": "Logical Reasoning",
            "mathematics": "Mathematics"
        }[section_id]
        
        section_results.append(SectionResult(
            section_name=section_name,
            total_questions=len(questions),
            attempted=attempted,
            correct=correct,
            wrong=wrong,
            marks=section_marks
        ))
    
    max_marks = 390
    percentage = (total_marks / max_marks) * 100 if max_marks > 0 else 0
    
    result = QuizResult(
        sections=section_results,
        total_marks=total_marks,
        max_marks=max_marks,
        percentage=percentage,
        time_taken=request.time_taken
    )
    
    result_dict = result.model_dump()
    result_dict['timestamp'] = result_dict['timestamp'].isoformat()
    await db.bitsat_results.insert_one(result_dict)
    
    return result

@api_router.get("/quiz/correct-answers")
async def get_correct_answers():
    return {
        "physics": {q["id"]: q["correct_answer"] for q in PHYSICS_QUESTIONS},
        "chemistry": {q["id"]: q["correct_answer"] for q in CHEMISTRY_QUESTIONS},
        "english": {q["id"]: q["correct_answer"] for q in ENGLISH_QUESTIONS},
        "logical": {q["id"]: q["correct_answer"] for q in LOGICAL_REASONING_QUESTIONS},
        "mathematics": {q["id"]: q["correct_answer"] for q in MATHEMATICS_QUESTIONS}
    }

# ============== EMPLOYEE SKILL ASSESSMENT API ENDPOINTS ==============
# Import questions from separate file
from employee_questions import EMPLOYEE_SKILL_QUESTIONS

# Section configuration for Employee Skill Assessment
EMPLOYEE_SECTIONS = {
    "parent_interaction": {"name": "Parent Interaction", "name_te": "పేరెంట్ ఇంటరాక్షన్"},
    "counseling": {"name": "Counseling", "name_te": "కౌన్సెలింగ్"},
    "ethics": {"name": "Ethics", "name_te": "నైతికత"},
    "data_privacy": {"name": "Data Privacy", "name_te": "డేటా ప్రైవసీ"},
    "communication": {"name": "Communication", "name_te": "కమ్యూనికేషన్"}
}

# Models for Employee Skill Assessment
class EmployeeRegister(BaseModel):
    name: str
    designation: str
    mobile: str
    email: str

class AdminLogin(BaseModel):
    username: str
    password: str

class EmployeeAnswer(BaseModel):
    question_id: int
    selected_answer: int

class EmployeeSubmitRequest(BaseModel):
    employee_id: str
    answers: List[EmployeeAnswer]
    time_taken: int

@api_router.get("/employee-skill/")
async def employee_skill_root():
    return {"message": "Employee Skill Assessment API"}

@api_router.get("/employee-skill/questions")
async def get_employee_questions():
    return {"questions": EMPLOYEE_SKILL_QUESTIONS}

@api_router.get("/employee-skill/sections")
async def get_employee_sections():
    sections = []
    for section_id, section_info in EMPLOYEE_SECTIONS.items():
        count = len([q for q in EMPLOYEE_SKILL_QUESTIONS if q["section"] == section_id])
        sections.append({
            "id": section_id,
            "name": section_info["name"],
            "name_te": section_info["name_te"],
            "questions": count
        })
    return {"sections": sections, "total_questions": len(EMPLOYEE_SKILL_QUESTIONS)}

@api_router.post("/employee-skill/register")
async def register_employee(data: EmployeeRegister):
    # Check if mobile already exists
    existing = await db.employees.find_one({"mobile": data.mobile})
    if existing:
        return {"success": False, "message": "Mobile number already registered. Please login."}
    
    employee = {
        "id": str(uuid.uuid4()),
        "name": data.name,
        "designation": data.designation,
        "mobile": data.mobile,
        "email": data.email,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.employees.insert_one(employee)
    # Return full employee data (excluding MongoDB _id)
    return {"_id": employee["id"], "name": employee["name"], "designation": employee["designation"], "mobile": employee["mobile"], "email": employee["email"]}

class EmployeeLogin(BaseModel):
    mobile: str

@api_router.post("/employee-skill/login")
async def login_employee(data: EmployeeLogin):
    employee = await db.employees.find_one({"mobile": data.mobile}, {"_id": 0})
    if employee:
        # Update last login time
        await db.employees.update_one(
            {"mobile": data.mobile},
            {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
        )
        
        # Check if there's an active test session
        session = await db.employee_test_sessions.find_one(
            {"employee_id": employee["id"], "is_active": True},
            {"_id": 0}
        )
        
        # Return full employee data with session info
        return {
            "_id": employee["id"],
            "name": employee["name"],
            "designation": employee["designation"],
            "mobile": employee["mobile"],
            "email": employee.get("email", ""),
            "last_activity": employee.get("last_activity", ""),
            "has_active_session": session is not None
        }
    return {"success": False, "message": "Mobile number not found. Please register."}

# Auto-save answer model
class SaveAnswerRequest(BaseModel):
    employee_id: str
    question_id: int
    selected_answer: int
    section: str

# Test Session model for tracking ongoing tests
class TestSessionUpdate(BaseModel):
    employee_id: str
    current_section: str
    current_question: int
    time_remaining: int
    answers: dict  # {question_key: answer_index}
    marked_for_review: dict  # {question_key: bool}
    visited_questions: dict  # {question_key: bool}

@api_router.post("/employee-skill/save-answer")
async def save_answer(data: SaveAnswerRequest):
    """Auto-save individual answer when employee selects an option"""
    # Upsert the answer - update if exists, insert if new
    await db.employee_progress.update_one(
        {"employee_id": data.employee_id, "question_id": data.question_id},
        {"$set": {
            "employee_id": data.employee_id,
            "question_id": data.question_id,
            "selected_answer": data.selected_answer,
            "section": data.section,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )
    return {"success": True, "message": "Answer saved"}

@api_router.post("/employee-skill/save-session")
async def save_test_session(data: TestSessionUpdate):
    """Save complete test session state for resuming later"""
    session_data = {
        "employee_id": data.employee_id,
        "current_section": data.current_section,
        "current_question": data.current_question,
        "time_remaining": data.time_remaining,
        "answers": data.answers,
        "marked_for_review": data.marked_for_review,
        "visited_questions": data.visited_questions,
        "last_activity": datetime.now(timezone.utc).isoformat(),
        "is_active": True
    }
    
    # Upsert - update existing session or create new one
    await db.employee_test_sessions.update_one(
        {"employee_id": data.employee_id},
        {"$set": session_data},
        upsert=True
    )
    
    # Also update last login activity
    await db.employees.update_one(
        {"id": data.employee_id},
        {"$set": {"last_activity": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"success": True, "message": "Session saved", "timestamp": session_data["last_activity"]}

@api_router.get("/employee-skill/get-session/{employee_id}")
async def get_test_session(employee_id: str):
    """Get saved test session for an employee to resume"""
    session = await db.employee_test_sessions.find_one(
        {"employee_id": employee_id, "is_active": True},
        {"_id": 0}
    )
    
    if session:
        return {
            "success": True,
            "has_active_session": True,
            "session": session
        }
    
    return {"success": True, "has_active_session": False, "session": None}

@api_router.delete("/employee-skill/clear-session/{employee_id}")
async def clear_test_session(employee_id: str):
    """Mark test session as inactive after submission"""
    await db.employee_test_sessions.update_one(
        {"employee_id": employee_id},
        {"$set": {"is_active": False, "completed_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"success": True, "message": "Session cleared"}

@api_router.get("/employee-skill/get-progress/{employee_id}")
async def get_progress(employee_id: str):
    """Get saved answers for an employee to restore progress"""
    progress = await db.employee_progress.find(
        {"employee_id": employee_id}, 
        {"_id": 0}
    ).to_list(500)
    
    # Convert to dictionary format {question_id: selected_answer}
    answers = {p["question_id"]: p["selected_answer"] for p in progress}
    return {"success": True, "answers": answers, "count": len(answers)}

@api_router.delete("/employee-skill/clear-progress/{employee_id}")
async def clear_progress(employee_id: str):
    """Clear saved progress after test submission"""
    await db.employee_progress.delete_many({"employee_id": employee_id})
    return {"success": True, "message": "Progress cleared"}

@api_router.post("/employee-skill/admin/login")
async def admin_login(data: AdminLogin):
    # Simple admin auth (in production, use proper auth)
    if data.username == "venureddy.josh" and data.password == "Josh@123":
        return {"success": True, "message": "Login successful", "admin_id": "admin-001"}
    return {"success": False, "message": "Invalid credentials"}

@api_router.post("/employee-skill/submit")
async def submit_employee_test(request: EmployeeSubmitRequest):
    # Get employee info
    employee = await db.employees.find_one({"id": request.employee_id}, {"_id": 0})
    
    section_results = []
    total_correct = 0
    total_attempted = 0
    
    for section_id in EMPLOYEE_SECTIONS.keys():
        section_questions = [q for q in EMPLOYEE_SKILL_QUESTIONS if q["section"] == section_id]
        section_answers = [a for a in request.answers if any(q["id"] == a.question_id and q["section"] == section_id for q in EMPLOYEE_SKILL_QUESTIONS)]
        
        correct = 0
        attempted = len(section_answers)
        
        for answer in section_answers:
            question = next((q for q in section_questions if q["id"] == answer.question_id), None)
            if question and answer.selected_answer == question["correct_answer"]:
                correct += 1
        
        section_results.append({
            "section_id": section_id,
            "section_name": EMPLOYEE_SECTIONS[section_id]["name"],
            "total_questions": len(section_questions),
            "attempted": attempted,
            "correct": correct,
            "wrong": attempted - correct,
            "score": correct,
            "percentage": (correct / len(section_questions) * 100) if section_questions else 0
        })
        total_correct += correct
        total_attempted += attempted
    
    total_questions = len(EMPLOYEE_SKILL_QUESTIONS)
    overall_percentage = (total_correct / total_questions * 100) if total_questions else 0
    
    result = {
        "id": str(uuid.uuid4()),
        "employee_id": request.employee_id,
        "employee_name": employee["name"] if employee else "Unknown",
        "designation": employee.get("designation", "") if employee else "",
        "sections": section_results,
        "total_questions": total_questions,
        "total_attempted": total_attempted,
        "total_correct": total_correct,
        "score": total_correct,
        "percentage": round(overall_percentage, 2),
        "time_taken": request.time_taken,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    # Make a copy for database insertion (to avoid _id being added to response)
    result_for_db = result.copy()
    await db.employee_test_results.insert_one(result_for_db)
    
    # Clear the test session after successful submission
    await db.employee_test_sessions.update_one(
        {"employee_id": request.employee_id},
        {"$set": {"is_active": False, "completed_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Clear individual answer progress
    await db.employee_progress.delete_many({"employee_id": request.employee_id})
    
    return result

@api_router.get("/employee-skill/admin/stats")
async def get_admin_stats():
    total_employees = await db.employees.count_documents({})
    total_tests = await db.employee_test_results.count_documents({})
    
    # Calculate average score
    pipeline = [
        {"$group": {"_id": None, "avgScore": {"$avg": "$percentage"}}}
    ]
    avg_result = await db.employee_test_results.aggregate(pipeline).to_list(1)
    avg_score = avg_result[0]["avgScore"] if avg_result else 0
    
    # Get recent results
    recent_results = await db.employee_test_results.find({}, {"_id": 0}).sort("timestamp", -1).limit(10).to_list(10)
    
    # Get all employees
    employees = await db.employees.find({}, {"_id": 0}).to_list(1000)
    
    return {
        "total_employees": total_employees,
        "tests_completed": total_tests,
        "average_score": round(avg_score, 1) if avg_score else 0,
        "recent_results": recent_results,
        "employees": employees
    }

@api_router.get("/employee-skill/admin/results")
async def get_all_results():
    results = await db.employee_test_results.find({}, {"_id": 0}).to_list(1000)
    return {"results": results}

@api_router.get("/employee-skill/admin/employees")
async def get_all_employees():
    employees = await db.employees.find({}, {"_id": 0}).to_list(1000)
    return {"employees": employees}

class SuggestionRequest(BaseModel):
    employee_id: str
    suggestion: str

@api_router.post("/employee-skill/admin/suggestion")
async def add_suggestion(data: SuggestionRequest):
    suggestion = {
        "id": str(uuid.uuid4()),
        "employee_id": data.employee_id,
        "suggestion": data.suggestion,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.suggestions.insert_one(suggestion)
    return {"success": True, "message": "Suggestion added"}

@api_router.get("/employee-skill/admin/suggestions/{employee_id}")
async def get_suggestions(employee_id: str):
    suggestions = await db.suggestions.find({"employee_id": employee_id}, {"_id": 0}).to_list(100)
    return {"suggestions": suggestions}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
