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

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============== BITSAT MOCK TEST QUESTIONS ==============

# SECTION 1: PHYSICS (30 Questions)
PHYSICS_QUESTIONS = [
    {"id": 1, "question": "Which of the following molecules has the highest dipole moment?", "options": {"A": "NH₃", "B": "NF₃", "C": "CO₂", "D": "BF₃"}, "correct_answer": "A", "hint": "Consider the electronegativity difference and molecular geometry."},
    {"id": 2, "question": "A body is projected vertically upward with velocity 40 m/s. The displacement after 5s is (g = 10 m/s²):", "options": {"A": "50 m", "B": "75 m", "C": "100 m", "D": "125 m"}, "correct_answer": "B", "hint": "Use s = ut + ½at² with proper signs."},
    {"id": 3, "question": "The dimension of Planck's constant is same as:", "options": {"A": "Energy", "B": "Linear momentum", "C": "Angular momentum", "D": "Force"}, "correct_answer": "C", "hint": "E = hν, find dimensions of h."},
    {"id": 4, "question": "Two vectors A and B have magnitudes 3 and 4 respectively. If A × B = 6k̂, then A · B equals:", "options": {"A": "6", "B": "8", "C": "10", "D": "6√3"}, "correct_answer": "D", "hint": "Use |A × B| = AB sinθ and A · B = AB cosθ."},
    {"id": 5, "question": "A particle moves in a circle of radius 5 cm with constant speed and time period 0.2π s. The acceleration of the particle is:", "options": {"A": "5 m/s²", "B": "10 m/s²", "C": "15 m/s²", "D": "25 m/s²"}, "correct_answer": "A", "hint": "Use a = ω²r = (2π/T)²r."},
    {"id": 6, "question": "The escape velocity from the surface of earth is ve. The escape velocity from a planet whose mass and radius are 3 times those of earth is:", "options": {"A": "ve", "B": "3ve", "C": "9ve", "D": "27ve"}, "correct_answer": "A", "hint": "ve = √(2GM/R), substitute 3M and 3R."},
    {"id": 7, "question": "A spring of force constant k is cut into two equal parts. The force constant of each part is:", "options": {"A": "k", "B": "2k", "C": "k/2", "D": "4k"}, "correct_answer": "B", "hint": "Force constant is inversely proportional to length."},
    {"id": 8, "question": "The moment of inertia of a uniform circular disc about its diameter is I. Its moment of inertia about an axis perpendicular to its plane and passing through center is:", "options": {"A": "I", "B": "2I", "C": "I/2", "D": "4I"}, "correct_answer": "B", "hint": "Use perpendicular axis theorem."},
    {"id": 9, "question": "Two identical balls A and B are moving with velocities +0.5 m/s and -0.3 m/s respectively. If they collide head on elastically, then their velocities after collision are:", "options": {"A": "+0.5 m/s and -0.3 m/s", "B": "-0.3 m/s and +0.5 m/s", "C": "+0.3 m/s and -0.5 m/s", "D": "-0.5 m/s and +0.3 m/s"}, "correct_answer": "B", "hint": "In elastic collision of identical masses, velocities get exchanged."},
    {"id": 10, "question": "A carnot engine working between 300K and 600K has work output 800J per cycle. What is the heat absorbed from the source?", "options": {"A": "800 J", "B": "1200 J", "C": "1600 J", "D": "2400 J"}, "correct_answer": "C", "hint": "Efficiency η = 1 - T₂/T₁ = W/Q₁."},
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
    {"id": 22, "question": "In a p-n junction diode, the width of depletion region is:", "options": {"A": "Independent of applied voltage", "B": "Increased under forward bias", "C": "Decreased under reverse bias", "D": "Increased under reverse bias"}, "correct_answer": "D", "hint": "Reverse bias increases the potential barrier."},
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
    {"id": 1, "question": "Which one of the carbocations is most stable?", "options": {"A": "CH₃⁺", "B": "(CH₃)₂CH⁺", "C": "(CH₃)₃C⁺", "D": "C₂H₅⁺"}, "correct_answer": "C", "hint": "Tertiary carbocations are most stable due to hyperconjugation and inductive effect."},
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
    {"id": 6, "question": "If 5 + 3 = 28, 9 + 1 = 810, then 2 + 6 = ?", "options": {"A": "__(4)__8", "B": "__(2)__6", "C": "__(4)__6", "D": "48"}, "correct_answer": "A", "hint": "Pattern: (difference)(sum)."},
    {"id": 7, "question": "Complete the series: AZ, BY, CX, DW, ?", "options": {"A": "EU", "B": "EV", "C": "FV", "D": "EX"}, "correct_answer": "B", "hint": "First letter increases, second decreases."},
    {"id": 8, "question": "Find the missing number: 3, 9, 27, 81, ?", "options": {"A": "162", "B": "243", "C": "324", "D": "729"}, "correct_answer": "B", "hint": "Each term is multiplied by 3."},
    {"id": 9, "question": "If CAT = 24, DOG = 26, then BAT = ?", "options": {"A": "22", "B": "23", "C": "24", "D": "25"}, "correct_answer": "B", "hint": "Sum of letter positions: C=3, A=1, T=20."},
    {"id": 10, "question": "Choose the mirror image of DELHI:", "options": {"A": "IHLƎD", "B": "IHLED", "C": "DƎLHI", "D": "IHLƎD"}, "correct_answer": "A", "hint": "In mirror image, letters are reversed and flipped."},
    {"id": 11, "question": "Find the next: 1, 1, 2, 3, 5, 8, 13, ?", "options": {"A": "18", "B": "20", "C": "21", "D": "26"}, "correct_answer": "C", "hint": "Fibonacci sequence: each term = sum of previous two."},
    {"id": 12, "question": "If Monday = 1, Tuesday = 2... then Friday + Saturday = ?", "options": {"A": "10", "B": "11", "C": "12", "D": "13"}, "correct_answer": "B", "hint": "Friday = 5, Saturday = 6."},
    {"id": 13, "question": "Complete: 2, 5, 10, 17, 26, ?", "options": {"A": "35", "B": "37", "C": "39", "D": "41"}, "correct_answer": "B", "hint": "Differences are 3, 5, 7, 9, 11..."},
    {"id": 14, "question": "CHAIR is to SIT as BED is to:", "options": {"A": "Stand", "B": "Sleep", "C": "Room", "D": "Furniture"}, "correct_answer": "B", "hint": "Function relationship."},
    {"id": 15, "question": "If ROAD = 51 and PATH = 50, then LANE = ?", "options": {"A": "30", "B": "32", "C": "36", "D": "40"}, "correct_answer": "C", "hint": "Sum of positions: L=12, A=1, N=14, E=5."},
    {"id": 16, "question": "Pointing to a man, a woman said 'His mother is the only daughter of my mother.' How is the woman related to the man?", "options": {"A": "Mother", "B": "Daughter", "C": "Sister", "D": "Grandmother"}, "correct_answer": "A", "hint": "Only daughter of my mother = myself."},
    {"id": 17, "question": "Find the odd one: January, March, May, June, July", "options": {"A": "January", "B": "March", "C": "June", "D": "July"}, "correct_answer": "C", "hint": "All except one have 31 days."},
    {"id": 18, "question": "Complete: Z, X, V, T, R, ?", "options": {"A": "O", "B": "P", "C": "Q", "D": "N"}, "correct_answer": "B", "hint": "Alternate letters going backwards."},
    {"id": 19, "question": "If 'COMPUTER' is written as 'RFUVQNPC', then 'MEDICINE' is written as:", "options": {"A": "MFEJDJOF", "B": "ENICIDME", "C": "FNDJDJOF", "D": "GFEJEJPG"}, "correct_answer": "A", "hint": "Each letter is replaced by next letter and reversed."},
    {"id": 20, "question": "What comes next: 1, 4, 9, 16, 25, ?", "options": {"A": "30", "B": "35", "C": "36", "D": "49"}, "correct_answer": "C", "hint": "Perfect squares: 1², 2², 3², 4², 5², 6²."}
]

# SECTION 4: MATHEMATICS (30 Questions)
MATHEMATICS_QUESTIONS = [
    {"id": 1, "question": "A particle moves along a straight line such that s = t³ - 6t² + 3t + 4 meters. Find velocity when acceleration is zero.", "options": {"A": "-9 m/s", "B": "0 m/s", "C": "-12 m/s", "D": "3 m/s"}, "correct_answer": "A", "hint": "v = ds/dt, a = dv/dt. Set a = 0 to find t."},
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
    {"id": 24, "question": "d/dx (log x) equals:", "options": {"A": "1/x", "B": "x", "C": "log x", "D": "e^x"}, "correct_answer": "A", "hint": "Standard derivative formula."},
    {"id": 25, "question": "∫ e^x dx equals:", "options": {"A": "e^x", "B": "e^x + C", "C": "xe^x + C", "D": "e^x/x + C"}, "correct_answer": "B", "hint": "Integral of e^x is e^x."},
    {"id": 26, "question": "The number of permutations of 4 objects taken 2 at a time is:", "options": {"A": "6", "B": "8", "C": "12", "D": "24"}, "correct_answer": "C", "hint": "P(4,2) = 4!/(4-2)!."},
    {"id": 27, "question": "If f(x) = x³, then f'(2) = ?", "options": {"A": "6", "B": "8", "C": "12", "D": "24"}, "correct_answer": "C", "hint": "f'(x) = 3x², substitute x = 2."},
    {"id": 28, "question": "The distance between points (1,2) and (4,6) is:", "options": {"A": "3", "B": "4", "C": "5", "D": "7"}, "correct_answer": "C", "hint": "Use distance formula √[(x₂-x₁)² + (y₂-y₁)²]."},
    {"id": 29, "question": "The value of tan 45° is:", "options": {"A": "0", "B": "1", "C": "√3", "D": "1/√3"}, "correct_answer": "B", "hint": "tan 45° = sin 45°/cos 45°."},
    {"id": 30, "question": "The solution of differential equation dy/dx = y is:", "options": {"A": "y = Ce^x", "B": "y = Cx", "C": "y = Ce^(-x)", "D": "y = C/x"}, "correct_answer": "A", "hint": "Separate variables and integrate."}
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
    time_taken: int  # in seconds
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SubmitQuizRequest(BaseModel):
    answers: List[QuizAnswer]
    time_taken: int  # in seconds


# Routes
@api_router.get("/")
async def root():
    return {"message": "BITSAT Mock Test API"}

@api_router.get("/quiz/sections")
async def get_sections():
    """Get all section information"""
    return {
        "sections": [
            {"id": "physics", "name": "Physics", "questions": 30, "marks_per_question": 3, "negative_marking": -1},
            {"id": "chemistry", "name": "Chemistry", "questions": 30, "marks_per_question": 3, "negative_marking": -1},
            {"id": "english", "name": "English Proficiency", "questions": 10, "marks_per_question": 3, "negative_marking": -1},
            {"id": "logical", "name": "Logical Reasoning", "questions": 20, "marks_per_question": 3, "negative_marking": -1},
            {"id": "mathematics", "name": "Mathematics", "questions": 30, "marks_per_question": 3, "negative_marking": -1}
        ],
        "total_questions": 120,
        "max_marks": 360,
        "duration_minutes": 180
    }

@api_router.get("/quiz/questions/{section}")
async def get_section_questions(section: str):
    """Get questions for a specific section"""
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
    return [QuizQuestion(
        id=q["id"],
        question=q["question"],
        options=q["options"],
        hint=q["hint"]
    ) for q in questions]

@api_router.get("/quiz/all-questions")
async def get_all_questions():
    """Get all questions organized by section"""
    return {
        "physics": [QuizQuestion(id=q["id"], question=q["question"], options=q["options"], hint=q["hint"]) for q in PHYSICS_QUESTIONS],
        "chemistry": [QuizQuestion(id=q["id"], question=q["question"], options=q["options"], hint=q["hint"]) for q in CHEMISTRY_QUESTIONS],
        "english": [QuizQuestion(id=q["id"], question=q["question"], options=q["options"], hint=q["hint"]) for q in ENGLISH_QUESTIONS],
        "logical": [QuizQuestion(id=q["id"], question=q["question"], options=q["options"], hint=q["hint"]) for q in LOGICAL_REASONING_QUESTIONS],
        "mathematics": [QuizQuestion(id=q["id"], question=q["question"], options=q["options"], hint=q["hint"]) for q in MATHEMATICS_QUESTIONS]
    }

@api_router.post("/quiz/submit")
async def submit_quiz(request: SubmitQuizRequest):
    """Submit quiz and calculate results"""
    
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
    
    max_marks = 360
    percentage = (total_marks / max_marks) * 100 if max_marks > 0 else 0
    
    result = QuizResult(
        sections=section_results,
        total_marks=total_marks,
        max_marks=max_marks,
        percentage=percentage,
        time_taken=request.time_taken
    )
    
    # Save to database
    result_dict = result.model_dump()
    result_dict['timestamp'] = result_dict['timestamp'].isoformat()
    await db.bitsat_results.insert_one(result_dict)
    
    return result

@api_router.get("/quiz/correct-answers")
async def get_correct_answers():
    """Get all correct answers (for result display)"""
    return {
        "physics": {q["id"]: q["correct_answer"] for q in PHYSICS_QUESTIONS},
        "chemistry": {q["id"]: q["correct_answer"] for q in CHEMISTRY_QUESTIONS},
        "english": {q["id"]: q["correct_answer"] for q in ENGLISH_QUESTIONS},
        "logical": {q["id"]: q["correct_answer"] for q in LOGICAL_REASONING_QUESTIONS},
        "mathematics": {q["id"]: q["correct_answer"] for q in MATHEMATICS_QUESTIONS}
    }


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
