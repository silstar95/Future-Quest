"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, CheckCircle, Info, ChevronRight, Atom, Star } from "lucide-react"

// Define element types for our periodic table
type ElementCategory =
  | "alkali"
  | "alkaline"
  | "transition"
  | "post-transition"
  | "metalloid"
  | "nonmetal"
  | "noble"
  | "lanthanide"
  | "actinide"

interface Element {
  symbol: string
  name: string
  number: number
  category: ElementCategory
  row: number
  col: number
  info?: string
  description?: string
  ybcoRole?: string
}

interface MaterialSciencePeriodicTableProps {
  onComplete: () => void
}

// Helper function to get lanthanide symbol by index
const getLanthanideSymbol = (index: number): string => {
  const symbols = ["Ce", "Pr", "Nd", "Pm", "Sm", "Eu", "Gd", "Tb", "Dy", "Ho", "Er", "Tm", "Yb", "Lu"]
  return symbols[index]
}

// Helper function to get actinide symbol by index
const getActinideSymbol = (index: number): string => {
  const symbols = ["Th", "Pa", "U", "Np", "Pu", "Am", "Cm", "Bk", "Cf", "Es", "Fm", "Md", "No", "Lr"]
  return symbols[index]
}

export function MaterialSciencePeriodicTable({ onComplete }: MaterialSciencePeriodicTableProps) {
  // State to track which elements have been selected
  const [selectedElements, setSelectedElements] = useState<string[]>([])
  const [currentElementInfo, setCurrentElementInfo] = useState<Element | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  // State to track which element was just selected (for animations)
  const [lastSelectedElement, setLastSelectedElement] = useState<string | null>(null)

  // YBCO elements
  const ybcoElements = ["Y", "Ba", "Cu", "O"]
  const ybcoFull = ["Yttrium", "Barium", "Copper", "Oxygen"]

  // Check if all YBCO elements have been selected
  const allYbcoSelected = ybcoElements.every((el) => selectedElements.includes(el))

  // Effect to show success message when all YBCO elements are selected
  useEffect(() => {
    if (allYbcoSelected && !showSuccess) {
      setShowSuccess(true)
    }
  }, [selectedElements, allYbcoSelected])

  // Handle element click
  const handleElementClick = (element: Element) => {
    // Always show the element info
    setCurrentElementInfo(element)

    // Set as the last selected element to trigger animation
    setLastSelectedElement(element.symbol)

    // If it's a YBCO element and hasn't already been selected, add it to selected elements
    if (ybcoElements.includes(element.symbol)) {
      if (!selectedElements.includes(element.symbol)) {
        setSelectedElements((prev) => [...prev, element.symbol])
      }

      // Only for correct selections, clear the lastSelectedElement after a timeout
      setTimeout(() => {
        setLastSelectedElement(null)
      }, 2000)
    }
    // For incorrect selections, we don't clear the lastSelectedElement
    // It will stay highlighted until another element is clicked
  }

  // Get element category color class
  const getCategoryColor = (category: ElementCategory): string => {
    switch (category) {
      case "alkali":
        return "bg-rose-500"
      case "alkaline":
        return "bg-orange-500"
      case "transition":
        return "bg-amber-500"
      case "post-transition":
        return "bg-emerald-500"
      case "metalloid":
        return "bg-teal-500"
      case "nonmetal":
        return "bg-sky-500"
      case "noble":
        return "bg-purple-500"
      case "lanthanide":
        return "bg-indigo-400"
      case "actinide":
        return "bg-violet-400"
      default:
        return "bg-gray-400"
    }
  }

  // Get element category hover color class
  const getCategoryHoverColor = (category: ElementCategory): string => {
    switch (category) {
      case "alkali":
        return "hover:bg-rose-600"
      case "alkaline":
        return "hover:bg-orange-600"
      case "transition":
        return "hover:bg-amber-600"
      case "post-transition":
        return "hover:bg-emerald-600"
      case "metalloid":
        return "hover:bg-teal-600"
      case "nonmetal":
        return "hover:bg-sky-600"
      case "noble":
        return "hover:bg-purple-600"
      case "lanthanide":
        return "hover:bg-indigo-500"
      case "actinide":
        return "hover:bg-violet-500"
      default:
        return "hover:bg-gray-500"
    }
  }

  // Get element border class if it's a selected YBCO element
  const getElementBorder = (element: Element): string => {
    if (ybcoElements.includes(element.symbol) && selectedElements.includes(element.symbol)) {
      return "ring-4 ring-green-300 shadow-lg"
    }
    return ""
  }

  // Create the full periodic table data
  const createPeriodicTable = (): Element[] => {
    const elements: Element[] = [
      // Row 1
      {
        symbol: "H",
        name: "Hydrogen",
        number: 1,
        category: "nonmetal",
        row: 1,
        col: 1,
        info: "Lightest and most abundant element in the universe",
        description: "Used in many chemical processes",
      },
      {
        symbol: "He",
        name: "Helium",
        number: 2,
        category: "noble",
        row: 1,
        col: 18,
        info: "Second most abundant element in the universe",
        description: "Used in balloons and cooling",
      },

      // Row 2
      {
        symbol: "Li",
        name: "Lithium",
        number: 3,
        category: "alkali",
        row: 2,
        col: 1,
        info: "Lightest metal",
        description: "Used in batteries and psychiatric medication",
      },
      {
        symbol: "Be",
        name: "Beryllium",
        number: 4,
        category: "alkaline",
        row: 2,
        col: 2,
        info: "Relatively rare element",
        description: "Used in aerospace",
      },
      {
        symbol: "B",
        name: "Boron",
        number: 5,
        category: "metalloid",
        row: 2,
        col: 13,
        info: "Essential for plant growth",
        description: "Used in detergents and glass",
      },
      {
        symbol: "C",
        name: "Carbon",
        number: 6,
        category: "nonmetal",
        row: 2,
        col: 14,
        info: "Basis of organic chemistry",
        description: "Forms millions of compounds",
      },
      {
        symbol: "N",
        name: "Nitrogen",
        number: 7,
        category: "nonmetal",
        row: 2,
        col: 15,
        info: "78% of Earth's atmosphere",
        description: "Used in fertilizers",
      },
      {
        symbol: "O",
        name: "Oxygen",
        number: 8,
        category: "nonmetal",
        row: 2,
        col: 16,
        info: "Vital for respiration",
        description: "Most abundant element in Earth's crust",
        ybcoRole:
          "In YBCO, oxygen forms the critical bonding structure that allows electron flow. The oxygen content is crucial for superconductivity - even small deviations in oxygen concentration can significantly impact performance.",
      },
      {
        symbol: "F",
        name: "Fluorine",
        number: 9,
        category: "nonmetal",
        row: 2,
        col: 17,
        info: "Most reactive nonmetal",
        description: "Used in toothpaste",
      },
      {
        symbol: "Ne",
        name: "Neon",
        number: 10,
        category: "noble",
        row: 2,
        col: 18,
        info: "Inert gas",
        description: "Used in neon signs",
      },

      // Row 3
      {
        symbol: "Na",
        name: "Sodium",
        number: 11,
        category: "alkali",
        row: 3,
        col: 1,
        info: "Highly reactive metal",
        description: "Essential for life processes",
      },
      {
        symbol: "Mg",
        name: "Magnesium",
        number: 12,
        category: "alkaline",
        row: 3,
        col: 2,
        info: "Eighth most abundant element",
        description: "Used in alloys and medicine",
      },
      {
        symbol: "Al",
        name: "Aluminum",
        number: 13,
        category: "post-transition",
        row: 3,
        col: 13,
        info: "Most abundant metal",
        description: "Low density and corrosion resistant",
      },
      {
        symbol: "Si",
        name: "Silicon",
        number: 14,
        category: "metalloid",
        row: 3,
        col: 14,
        info: "Second most abundant element",
        description: "Used in electronics",
      },
      {
        symbol: "P",
        name: "Phosphorus",
        number: 15,
        category: "nonmetal",
        row: 3,
        col: 15,
        info: "Essential for life",
        description: "Used in fertilizers and detergents",
      },
      {
        symbol: "S",
        name: "Sulfur",
        number: 16,
        category: "nonmetal",
        row: 3,
        col: 16,
        info: "Known since ancient times",
        description: "Used in many industrial processes",
      },
      {
        symbol: "Cl",
        name: "Chlorine",
        number: 17,
        category: "nonmetal",
        row: 3,
        col: 17,
        info: "Used for water purification",
        description: "Essential for many organisms",
      },
      {
        symbol: "Ar",
        name: "Argon",
        number: 18,
        category: "noble",
        row: 3,
        col: 18,
        info: "Most abundant noble gas",
        description: "Used in light bulbs",
      },

      // Row 4
      {
        symbol: "K",
        name: "Potassium",
        number: 19,
        category: "alkali",
        row: 4,
        col: 1,
        info: "Essential for plant growth",
        description: "Important for nerve function",
      },
      {
        symbol: "Ca",
        name: "Calcium",
        number: 20,
        category: "alkaline",
        row: 4,
        col: 2,
        info: "Fifth most abundant element",
        description: "Essential for bones and teeth",
      },
      {
        symbol: "Sc",
        name: "Scandium",
        number: 21,
        category: "transition",
        row: 4,
        col: 3,
        info: "Rare earth element",
        description: "Used in aerospace and sporting goods",
      },
      {
        symbol: "Ti",
        name: "Titanium",
        number: 22,
        category: "transition",
        row: 4,
        col: 4,
        info: "Strong, lightweight metal",
        description: "Used in aerospace and medical implants",
      },
      {
        symbol: "V",
        name: "Vanadium",
        number: 23,
        category: "transition",
        row: 4,
        col: 5,
        info: "Silvery-gray metal",
        description: "Used in steel alloys",
      },
      {
        symbol: "Cr",
        name: "Chromium",
        number: 24,
        category: "transition",
        row: 4,
        col: 6,
        info: "Hard, shiny metal",
        description: "Used in stainless steel and plating",
      },
      {
        symbol: "Mn",
        name: "Manganese",
        number: 25,
        category: "transition",
        row: 4,
        col: 7,
        info: "Brittle, hard metal",
        description: "Used in steel production",
      },
      {
        symbol: "Fe",
        name: "Iron",
        number: 26,
        category: "transition",
        row: 4,
        col: 8,
        info: "Most common element on Earth",
        description: "Used in construction and manufacturing",
      },
      {
        symbol: "Co",
        name: "Cobalt",
        number: 27,
        category: "transition",
        row: 4,
        col: 9,
        info: "Ferromagnetic metal",
        description: "Used in batteries and alloys",
      },
      {
        symbol: "Ni",
        name: "Nickel",
        number: 28,
        category: "transition",
        row: 4,
        col: 10,
        info: "Silvery-white metal",
        description: "Used in coins and stainless steel",
      },
      {
        symbol: "Cu",
        name: "Copper",
        number: 29,
        category: "transition",
        row: 4,
        col: 11,
        info: "Excellent conductor of heat and electricity",
        description: "Used in electronics and construction",
        ybcoRole:
          "The copper-oxygen planes in YBCO are what enable superconductivity. Copper's unique electronic properties allow for the formation of Cooper pairs - paired electrons that can move without resistance through the material.",
      },
      {
        symbol: "Zn",
        name: "Zinc",
        number: 30,
        category: "transition",
        row: 4,
        col: 12,
        info: "Essential mineral for life",
        description: "Used in galvanizing and batteries",
      },
      {
        symbol: "Ga",
        name: "Gallium",
        number: 31,
        category: "post-transition",
        row: 4,
        col: 13,
        info: "Metal that melts near room temperature",
        description: "Used in electronics and thermometers",
      },
      {
        symbol: "Ge",
        name: "Germanium",
        number: 32,
        category: "metalloid",
        row: 4,
        col: 14,
        info: "Semiconductor material",
        description: "Used in fiber optics and electronics",
      },
      {
        symbol: "As",
        name: "Arsenic",
        number: 33,
        category: "metalloid",
        row: 4,
        col: 15,
        info: "Naturally occurring element",
        description: "Used in wood preservatives and alloys",
      },
      {
        symbol: "Se",
        name: "Selenium",
        number: 34,
        category: "nonmetal",
        row: 4,
        col: 16,
        info: "Essential trace element",
        description: "Used in electronics and glass production",
      },
      {
        symbol: "Br",
        name: "Bromine",
        number: 35,
        category: "nonmetal",
        row: 4,
        col: 17,
        info: "Liquid at room temperature",
        description: "Used in flame retardants",
      },
      {
        symbol: "Kr",
        name: "Krypton",
        number: 36,
        category: "noble",
        row: 4,
        col: 18,
        info: "Noble gas",
        description: "Used in lighting and lasers",
      },

      // Row 5
      {
        symbol: "Rb",
        name: "Rubidium",
        number: 37,
        category: "alkali",
        row: 5,
        col: 1,
        info: "Soft, silvery metal",
        description: "Used in research and specialty glass",
      },
      {
        symbol: "Sr",
        name: "Strontium",
        number: 38,
        category: "alkaline",
        row: 5,
        col: 2,
        info: "Soft, silver-colored metal",
        description: "Used in fireworks and glow-in-the-dark toys",
      },
      {
        symbol: "Y",
        name: "Yttrium",
        number: 39,
        category: "transition",
        row: 5,
        col: 3,
        info: "Rare earth metal with silvery color",
        description: "Used in LEDs and lasers",
        ybcoRole:
          "Yttrium provides stability to the crystal structure of YBCO. Its atomic size and bonding properties help maintain the layered perovskite structure necessary for superconductivity at higher temperatures.",
      },
      {
        symbol: "Zr",
        name: "Zirconium",
        number: 40,
        category: "transition",
        row: 5,
        col: 4,
        info: "Strong, corrosion-resistant metal",
        description: "Used in nuclear reactors and ceramics",
      },
      {
        symbol: "Nb",
        name: "Niobium",
        number: 41,
        category: "transition",
        row: 5,
        col: 5,
        info: "Soft, gray metal",
        description: "Used in steel alloys and superconductors",
      },
      {
        symbol: "Mo",
        name: "Molybdenum",
        number: 42,
        category: "transition",
        row: 5,
        col: 6,
        info: "High melting point metal",
        description: "Used in high-strength steel alloys",
      },
      {
        symbol: "Tc",
        name: "Technetium",
        number: 43,
        category: "transition",
        row: 5,
        col: 7,
        info: "Radioactive element",
        description: "Used in nuclear medicine",
      },
      {
        symbol: "Ru",
        name: "Ruthenium",
        number: 44,
        category: "transition",
        row: 5,
        col: 8,
        info: "Rare platinum group metal",
        description: "Used in electronics and catalysts",
      },
      {
        symbol: "Rh",
        name: "Rhodium",
        number: 45,
        category: "transition",
        row: 5,
        col: 9,
        info: "Rare, valuable metal",
        description: "Used in catalytic converters",
      },
      {
        symbol: "Pd",
        name: "Palladium",
        number: 46,
        category: "transition",
        row: 5,
        col: 10,
        info: "Least dense platinum group metal",
        description: "Used in catalytic converters and jewelry",
      },
      {
        symbol: "Ag",
        name: "Silver",
        number: 47,
        category: "transition",
        row: 5,
        col: 11,
        info: "Highest electrical conductivity",
        description: "Used in jewelry, electronics, and photography",
      },
      {
        symbol: "Cd",
        name: "Cadmium",
        number: 48,
        category: "transition",
        row: 5,
        col: 12,
        info: "Soft, bluish-white metal",
        description: "Used in batteries and pigments",
      },
      {
        symbol: "In",
        name: "Indium",
        number: 49,
        category: "post-transition",
        row: 5,
        col: 13,
        info: "Soft, malleable metal",
        description: "Used in touch screens and solar cells",
      },
      {
        symbol: "Sn",
        name: "Tin",
        number: 50,
        category: "post-transition",
        row: 5,
        col: 14,
        info: "Known since ancient times",
        description: "Used in solder and food packaging",
      },
      {
        symbol: "Sb",
        name: "Antimony",
        number: 51,
        category: "metalloid",
        row: 5,
        col: 15,
        info: "Lustrous gray metalloid",
        description: "Used in flame retardants and alloys",
      },
      {
        symbol: "Te",
        name: "Tellurium",
        number: 52,
        category: "metalloid",
        row: 5,
        col: 16,
        info: "Brittle, mildly toxic metalloid",
        description: "Used in solar panels and alloys",
      },
      {
        symbol: "I",
        name: "Iodine",
        number: 53,
        category: "nonmetal",
        row: 5,
        col: 17,
        info: "Essential for thyroid function",
        description: "Used in medicine and photography",
      },
      {
        symbol: "Xe",
        name: "Xenon",
        number: 54,
        category: "noble",
        row: 5,
        col: 18,
        info: "Heavy noble gas",
        description: "Used in lighting and medical imaging",
      },

      // Row 6
      {
        symbol: "Cs",
        name: "Cesium",
        number: 55,
        category: "alkali",
        row: 6,
        col: 1,
        info: "Most reactive metal",
        description: "Used in atomic clocks and vacuum tubes",
      },
      {
        symbol: "Ba",
        name: "Barium",
        number: 56,
        category: "alkaline",
        row: 6,
        col: 2,
        info: "Soft, silvery alkaline earth metal",
        description: "Used in drilling fluids and medical imaging",
        ybcoRole:
          "Barium atoms create the spacing between copper-oxygen planes in YBCO. This spacing is critical for creating the optimal environment for superconductivity, allowing for the right balance of electron movement and interaction.",
      },
      {
        symbol: "La",
        name: "Lanthanum",
        number: 57,
        category: "lanthanide",
        row: 6,
        col: 3,
        info: "First lanthanide element",
        description: "Used in carbon arc lights and camera lenses",
      },
      {
        symbol: "Hf",
        name: "Hafnium",
        number: 72,
        category: "transition",
        row: 6,
        col: 4,
        info: "Corrosion-resistant metal",
        description: "Used in nuclear control rods and plasma cutters",
      },
      {
        symbol: "Ta",
        name: "Tantalum",
        number: 73,
        category: "transition",
        row: 6,
        col: 5,
        info: "Corrosion-resistant metal",
        description: "Used in electronic components and surgical implants",
      },
      {
        symbol: "W",
        name: "Tungsten",
        number: 74,
        category: "transition",
        row: 6,
        col: 6,
        info: "Highest melting point of all elements",
        description: "Used in light bulb filaments and cutting tools",
      },
      {
        symbol: "Re",
        name: "Rhenium",
        number: 75,
        category: "transition",
        row: 6,
        col: 7,
        info: "Dense, heat-resistant metal",
        description: "Used in superalloys and flash photography",
      },
      {
        symbol: "Os",
        name: "Osmium",
        number: 76,
        category: "transition",
        row: 6,
        col: 8,
        info: "Densest naturally occurring element",
        description: "Used in electrical contacts and pen tips",
      },
      {
        symbol: "Ir",
        name: "Iridium",
        number: 77,
        category: "transition",
        row: 6,
        col: 9,
        info: "Corrosion-resistant metal",
        description: "Used in spark plugs and crucibles",
      },
      {
        symbol: "Pt",
        name: "Platinum",
        number: 78,
        category: "transition",
        row: 6,
        col: 10,
        info: "Precious, dense metal",
        description: "Used in catalytic converters and jewelry",
      },
      {
        symbol: "Au",
        name: "Gold",
        number: 79,
        category: "transition",
        row: 6,
        col: 11,
        info: "Highly valued precious metal",
        description: "Used in jewelry, electronics, and dentistry",
      },
      {
        symbol: "Hg",
        name: "Mercury",
        number: 80,
        category: "transition",
        row: 6,
        col: 12,
        info: "Liquid at room temperature",
        description: "Used in thermometers and electrical switches",
      },
      {
        symbol: "Tl",
        name: "Thallium",
        number: 81,
        category: "post-transition",
        row: 6,
        col: 13,
        info: "Soft, toxic metal",
        description: "Used in electronics and medical imaging",
      },
      {
        symbol: "Pb",
        name: "Lead",
        number: 82,
        category: "post-transition",
        row: 6,
        col: 14,
        info: "Dense, soft, malleable metal",
        description: "Used in batteries and radiation shielding",
      },
      {
        symbol: "Bi",
        name: "Bismuth",
        number: 83,
        category: "post-transition",
        row: 6,
        col: 15,
        info: "Crystalline, brittle metal",
        description: "Used in cosmetics and pharmaceuticals",
      },
      {
        symbol: "Po",
        name: "Polonium",
        number: 84,
        category: "post-transition",
        row: 6,
        col: 16,
        info: "Radioactive, rare element",
        description: "Used in antistatic devices and heat sources",
      },
      {
        symbol: "At",
        name: "Astatine",
        number: 85,
        category: "nonmetal",
        row: 6,
        col: 17,
        info: "Rarest naturally occurring element",
        description: "Used in research",
      },
      {
        symbol: "Rn",
        name: "Radon",
        number: 86,
        category: "noble",
        row: 6,
        col: 18,
        info: "Radioactive noble gas",
        description: "Used in radiation therapy and research",
      },

      // Row 7 (partial)
      {
        symbol: "Fr",
        name: "Francium",
        number: 87,
        category: "alkali",
        row: 7,
        col: 1,
        info: "Highly radioactive, rare element",
        description: "Used primarily in research",
      },
      {
        symbol: "Ra",
        name: "Radium",
        number: 88,
        category: "alkaline",
        row: 7,
        col: 2,
        info: "Radioactive, luminescent element",
        description: "Historically used in watches and medical treatments",
      },
      {
        symbol: "Ac",
        name: "Actinium",
        number: 89,
        category: "actinide",
        row: 7,
        col: 3,
        info: "First actinide element",
        description: "Used in neutron sources and medicine",
      },
      {
        symbol: "Rf",
        name: "Rutherfordium",
        number: 104,
        category: "transition",
        row: 7,
        col: 4,
        info: "Synthetic element",
        description: "Used only in research",
      },
    ]

    return elements
  }

  const periodicTable = createPeriodicTable()

  // Element detail view for selected element
  const ElementDetailView = ({ element }: { element: Element | null }) => {
    if (!element) return null

    const isYbcoElement = ybcoElements.includes(element.symbol)
    const isSelected = selectedElements.includes(element.symbol)

    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
        <div className="flex items-center gap-4 mb-4">
          <div
            className={`w-16 h-16 ${getCategoryColor(element.category)} rounded-lg flex items-center justify-center text-white text-2xl font-bold shadow-md`}
          >
            {element.symbol}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">
              {element.name}
              <span className="ml-2 text-lg text-slate-500">({element.number})</span>
            </h3>
            {isYbcoElement && (
              <Badge
                variant="outline"
                className={`mt-1 ${isSelected ? "bg-green-100 text-green-800 border-green-300" : "bg-blue-100 text-blue-800 border-blue-300"}`}
              >
                {isSelected ? (
                  <span className="flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" /> YBCO Component Selected
                  </span>
                ) : (
                  "YBCO Component - Click to Select"
                )}
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-4">
          <p className="text-slate-600 mb-2">
            <span className="font-medium text-slate-800">General Info:</span> {element.info}
          </p>
          <p className="text-slate-600 mb-4">
            <span className="font-medium text-slate-800">Common Uses:</span> {element.description}
          </p>

          {isYbcoElement && element.ybcoRole && (
            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-4 border border-blue-200 mt-2">
              <h4 className="font-bold text-blue-800 flex items-center mb-2">
                <Atom className="mr-2 h-4 w-4" />
                Role in YBCO Superconductor
              </h4>
              <p className="text-slate-700">{element.ybcoRole}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Celebration animation when correct element is selected
  const CelebrationOverlay = ({ symbol }: { symbol: string }) => {
    if (!lastSelectedElement || lastSelectedElement !== symbol) return null

    return (
      <motion.div
        className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="relative">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: 0,
                y: 0,
                scale: 0,
                opacity: 1,
              }}
              animate={{
                x: Math.sin(i * ((Math.PI * 2) / 12)) * 50,
                y: Math.cos(i * ((Math.PI * 2) / 12)) * 50,
                scale: 1,
                opacity: 0,
              }}
              transition={{
                duration: 1,
                ease: "easeOut",
              }}
              className="absolute w-3 h-3 rounded-full bg-green-400"
            />
          ))}
          <motion.div
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-green-500 font-bold flex items-center"
          >
            <Star className="w-6 h-6 mr-1" fill="currentColor" />
            <span>Correct!</span>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 shadow-lg">
        <CardHeader>
          <div className="text-center">
            <Badge
              variant="outline"
              className="mb-3 px-4 py-1 text-md font-medium bg-white/80 backdrop-blur-sm border-2 border-blue-300"
            >
              🧪 MATERIALS SCIENCE LAB 🧪
            </Badge>
            <CardTitle className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight mb-3">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600">
                Understanding YBCO Elements
              </span>
            </CardTitle>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              What exactly is YBCO? Select the corresponding elements on Mendeleev's periodic table to learn what
              characteristics make these elements ideal for a superconducting material.
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* Main content area */}
      <Card className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl border border-slate-200">
        {/* Progress tracker */}
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center space-x-4">
            {ybcoElements.map((symbol, index) => (
              <motion.div
                key={symbol}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                  selectedElements.includes(symbol)
                    ? "bg-green-500 text-white border-green-600"
                    : "bg-white text-slate-400 border-slate-300"
                }`}
                animate={
                  lastSelectedElement === symbol
                    ? {
                        scale: [1, 1.2, 1],
                        boxShadow: [
                          "0 0 0 rgba(34, 197, 94, 0)",
                          "0 0 20px rgba(34, 197, 94, 0.7)",
                          "0 0 0 rgba(34, 197, 94, 0)",
                        ],
                      }
                    : {}
                }
                transition={{ duration: 0.5 }}
              >
                {symbol}
              </motion.div>
            ))}
          </div>
          <div className="text-sm font-medium text-slate-500">
            {selectedElements.length}/{ybcoElements.length} elements identified
          </div>
        </div>

        {/* Success message when all YBCO elements are selected */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6"
            >
              <div className="flex items-start">
                <div className="bg-green-100 rounded-full p-2 mr-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-green-800 mb-1">
                    Great job! You've identified all the elements in YBCO!
                  </h3>
                  <p className="text-green-700">
                    Y<sub>1</sub>Ba<sub>2</sub>Cu<sub>3</sub>O<sub>7</sub> (YBCO) is a crystalline chemical compound
                    with a perovskite structure. It was the first material discovered to become superconducting above 77
                    K, making it viable for liquid nitrogen cooling.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 gap-6">
          {/* Periodic table grid */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
              <Badge variant="outline" className="mr-2 font-mono bg-blue-100 text-blue-800 border-blue-200">
                Task
              </Badge>
              Find and select the elements that make up YBCO
            </h2>

            {/* Improved periodic table display */}
            <div className="pb-4">
              <div className="w-full">
                <div className="bg-white p-2 rounded-xl shadow-sm">
                  {/* Instructions */}
                  <div className="mb-4 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <h3 className="font-bold text-slate-800 mb-1 flex items-center">
                      <Info className="w-4 h-4 mr-1 text-blue-600" />
                      Instructions
                    </h3>
                    <p className="text-sm text-slate-600">
                      Identify the <strong>four elements</strong> that form YBCO (YBa₂Cu₃O₇) by clicking on them in the
                      periodic table. The formula contains an important clue - the first letter of each element!
                    </p>
                  </div>

                  {/* Period labels and group numbers */}
                  <div className="flex mb-1">
                    <div className="w-6 mr-1">{/* Empty corner cell */}</div>
                    {/* Group numbers */}
                    <div className="flex-1 flex gap-0.5">
                      {[...Array(18)].map((_, index) => (
                        <div
                          key={index}
                          className="flex-1 h-4 flex items-center justify-center text-[9px] font-semibold text-slate-500"
                        >
                          {index + 1}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Main periodic table grid */}
                  <div className="flex">
                    {/* Period numbers on the left */}
                    <div className="w-6 mr-1 flex flex-col space-y-0.5">
                      {[1, 2, 3, 4, 5, 6, 7].map((period) => (
                        <div
                          key={period}
                          className="h-9 flex items-center justify-center text-[10px] font-bold text-slate-500"
                        >
                          {period}
                        </div>
                      ))}
                      <div className="h-9 flex items-center justify-center text-[10px] font-bold text-indigo-400">
                        *
                      </div>
                      <div className="h-9 flex items-center justify-center text-[10px] font-bold text-violet-400">
                        **
                      </div>
                    </div>

                    {/* Periodic table elements */}
                    <div className="flex-1">
                      <div className="grid grid-cols-18 gap-0.5">
                        {/* Main Elements */}
                        {periodicTable.map((element) => {
                          const { row, col, symbol, name, number, category } = element
                          const isYbcoElement = ybcoElements.includes(symbol)
                          const categoryColorClass = getCategoryColor(category)
                          const hoverColorClass = getCategoryHoverColor(category)
                          const borderClass = getElementBorder(element)

                          // Skip lanthanides and actinides for now - we'll add them separately
                          if ((category === "lanthanide" && row !== 6) || (category === "actinide" && row !== 7)) {
                            return null
                          }

                          // Only show cells where elements actually exist
                          if (row > 7) return null

                          return (
                            <motion.div
                              key={`${row}-${col}`}
                              className="relative"
                              style={{
                                gridRow: row,
                                gridColumn: col,
                              }}
                            >
                              <motion.button
                                className={`w-full h-9 flex flex-col items-center justify-center rounded-sm text-white
                                   ${categoryColorClass} ${hoverColorClass} ${borderClass}
                                   transition-all duration-200 hover:scale-105 cursor-pointer relative`}
                                onClick={() => handleElementClick(element)}
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                animate={
                                  isYbcoElement && selectedElements.includes(symbol)
                                    ? {
                                        boxShadow: [
                                          "0 0 0 rgba(34, 197, 94, 0.4)",
                                          "0 0 8px rgba(34, 197, 94, 0.7)",
                                          "0 0 0 rgba(34, 197, 94, 0.4)",
                                        ],
                                      }
                                    : {}
                                }
                                transition={{
                                  boxShadow: { repeat: Number.POSITIVE_INFINITY, duration: 1.5 },
                                }}
                              >
                                <div className="text-[6px] opacity-70 absolute top-0.5 left-0.5">{number}</div>
                                <div className="text-[10px] font-bold">{symbol}</div>
                                <div className="text-[6px] mt-0.5 opacity-80 line-clamp-1 px-0.5 text-center">
                                  {name}
                                </div>
                              </motion.button>

                              {/* Selected feedback indicator */}
                              <AnimatePresence>
                                {lastSelectedElement === symbol && (
                                  <motion.div
                                    className={`absolute inset-0 pointer-events-none z-40 flex items-center justify-center
                                      ${isYbcoElement ? "bg-green-500/20" : "bg-red-500/20"} rounded-sm`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                  >
                                    {/* Icon showing correct or incorrect selection */}
                                    <motion.div
                                      className={`${isYbcoElement ? "text-green-500" : "text-red-500"} bg-white rounded-full p-0.5`}
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ type: "spring", duration: 0.5 }}
                                    >
                                      {isYbcoElement ? (
                                        <CheckCircle className="w-3 h-3" />
                                      ) : (
                                        <motion.div
                                          className="w-3 h-3 flex items-center justify-center text-[8px] font-bold"
                                          animate={{ rotate: [0, 10, -10, 0] }}
                                          transition={{ duration: 0.5 }}
                                        >
                                          ✗
                                        </motion.div>
                                      )}
                                    </motion.div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          )
                        })}

                        {/* Lanthanide and Actinide indicators */}
                        <div
                          className="bg-indigo-400 col-span-1 h-9 flex items-center justify-center text-white text-[10px] rounded-sm"
                          style={{ gridRow: 6, gridColumn: 3 }}
                        >
                          *
                        </div>
                        <div
                          className="bg-violet-400 col-span-1 h-9 flex items-center justify-center text-white text-[10px] rounded-sm"
                          style={{ gridRow: 7, gridColumn: 3 }}
                        >
                          **
                        </div>
                      </div>

                      {/* Lanthanide row */}
                      <div className="mt-1 flex gap-0.5">
                        <div className="w-6 h-9 text-[10px] text-indigo-500 font-bold flex items-center justify-end pr-1">
                          *
                        </div>
                        {[...Array(14)].map((_, i) => {
                          const lanthanideNumber = 57 + i + 1
                          const lanthanideSymbol = getLanthanideSymbol(i)

                          return (
                            <div
                              key={`lanthanide-${i}`}
                              className="flex-1 bg-indigo-400 hover:bg-indigo-500 transition-all h-9 flex flex-col items-center justify-center text-white rounded-sm relative"
                            >
                              <div className="text-[6px] opacity-70 absolute top-0.5 left-0.5">{lanthanideNumber}</div>
                              <div className="text-[10px] font-bold">{lanthanideSymbol}</div>
                              <div className="text-[6px] mt-0.5 opacity-80 line-clamp-1 px-0.5 text-center">
                                {
                                  [
                                    "Cerium",
                                    "Praseodymium",
                                    "Neodymium",
                                    "Promethium",
                                    "Samarium",
                                    "Europium",
                                    "Gadolinium",
                                    "Terbium",
                                    "Dysprosium",
                                    "Holmium",
                                    "Erbium",
                                    "Thulium",
                                    "Ytterbium",
                                    "Lutetium",
                                  ][i]
                                }
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Actinide row */}
                      <div className="mt-0.5 flex gap-0.5">
                        <div className="w-6 h-9 text-[10px] text-violet-500 font-bold flex items-center justify-end pr-1">
                          **
                        </div>
                        {[...Array(14)].map((_, i) => {
                          const actinideNumber = 89 + i + 1
                          const actinideSymbol = getActinideSymbol(i)

                          return (
                            <div
                              key={`actinide-${i}`}
                              className="flex-1 bg-violet-400 hover:bg-violet-500 transition-all h-9 flex flex-col items-center justify-center text-white rounded-sm relative"
                            >
                              <div className="text-[6px] opacity-70 absolute top-0.5 left-0.5">{actinideNumber}</div>
                              <div className="text-[10px] font-bold">{actinideSymbol}</div>
                              <div className="text-[6px] mt-0.5 opacity-80 line-clamp-1 px-0.5 text-center">
                                {
                                  [
                                    "Thorium",
                                    "Protactinium",
                                    "Uranium",
                                    "Neptunium",
                                    "Plutonium",
                                    "Americium",
                                    "Curium",
                                    "Berkelium",
                                    "Californium",
                                    "Einsteinium",
                                    "Fermium",
                                    "Mendelevium",
                                    "Nobelium",
                                    "Lawrencium",
                                  ][i]
                                }
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Element detail view below the periodic table */}
                  {currentElementInfo ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-6 bg-slate-50 p-4 rounded-lg border border-slate-200"
                    >
                      <ElementDetailView element={currentElementInfo} />

                      {/* Feedback message */}
                      {currentElementInfo && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.3 }}
                          className={`mt-3 p-3 rounded-lg border ${
                            ybcoElements.includes(currentElementInfo.symbol)
                              ? "bg-green-50 border-green-200 text-green-800"
                              : "bg-red-50 border-red-200 text-red-800"
                          }`}
                        >
                          {ybcoElements.includes(currentElementInfo.symbol) ? (
                            <div className="flex items-center">
                              <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                              <span>
                                <strong>Correct!</strong> {currentElementInfo.symbol} is one of the elements in YBCO.
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <div className="w-4 h-4 mr-2 flex items-center justify-center font-bold text-red-500">
                                ✗
                              </div>
                              <span>
                                <strong>Not quite!</strong> {currentElementInfo.symbol} is not part of the YBCO formula.
                              </span>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </motion.div>
                  ) : (
                    <div className="mt-6 bg-slate-50 p-4 rounded-lg border border-slate-200 text-center">
                      <Info className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-600">Click on an element in the periodic table to view its details.</p>
                    </div>
                  )}

                  {/* Progress tracker at the bottom */}
                  <div className="mt-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-slate-800">YBCO Element Progress</h3>
                      <div className="text-sm font-medium text-slate-600">
                        {selectedElements.length}/{ybcoElements.length} elements identified
                      </div>
                    </div>

                    <div className="flex justify-center gap-3 mb-3">
                      {ybcoElements.map((symbol, index) => (
                        <motion.div
                          key={symbol}
                          className={`w-16 h-16 rounded-lg flex flex-col items-center justify-center text-sm border-2 transition-all ${
                            selectedElements.includes(symbol)
                              ? "bg-green-100 text-green-800 border-green-300"
                              : "bg-white text-slate-400 border-slate-200"
                          }`}
                          animate={
                            lastSelectedElement === symbol
                              ? {
                                  scale: [1, 1.1, 1],
                                  boxShadow: [
                                    "0 0 0 rgba(34, 197, 94, 0)",
                                    "0 0 15px rgba(34, 197, 94, 0.7)",
                                    "0 0 0 rgba(34, 197, 94, 0)",
                                  ],
                                }
                              : {}
                          }
                          transition={{ duration: 0.5 }}
                        >
                          <span className="text-xl font-bold">{symbol}</span>
                          <span className="text-xs">{ybcoFull[index]}</span>
                        </motion.div>
                      ))}
                    </div>

                    <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                      <motion.div
                        className="bg-green-500 h-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(selectedElements.length / ybcoElements.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>

                  {/* Success message - final overview */}
                  {showSuccess && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      className="mt-4 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-5 border border-blue-200 shadow-md"
                    >
                      <h3 className="font-bold text-slate-800 mb-3 flex items-center">
                        <Atom className="text-blue-600 mr-2 h-5 w-5" />
                        YBCO Structure Overview
                      </h3>
                      <p className="text-slate-700 text-sm mb-3">
                        Great job! You've identified all four elements in YBa₂Cu₃O₇:
                      </p>
                      <ul className="space-y-1 mb-3">
                        {ybcoElements.map((symbol, i) => (
                          <motion.li
                            key={i}
                            className="flex items-start bg-white/50 p-2 rounded-lg border border-blue-100"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 + i * 0.1 }}
                          >
                            <ChevronRight className="h-4 w-4 text-blue-600 shrink-0 mt-0.5 mr-1" />
                            <div>
                              <span className="font-bold text-blue-700">{ybcoFull[i]}</span>
                              <span className="text-slate-600 text-sm ml-1">({symbol})</span>
                            </div>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Navigation button */}
      <div className="flex justify-center mt-8">
        <Button
          onClick={onComplete}
          className={`group relative overflow-hidden ${
            allYbcoSelected
              ? "bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              : "bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
          }
            text-white shadow-lg`}
          size="lg"
          disabled={!allYbcoSelected}
        >
          <span className="relative z-10 flex items-center text-lg font-medium">
            {allYbcoSelected ? "Continue to Hypothesis" : "Select All YBCO Elements"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </span>
          <motion.span
            className="absolute inset-0 bg-white/20"
            initial={{ y: "100%" }}
            whileHover={{ y: 0 }}
            transition={{ duration: 0.3 }}
          />
        </Button>
      </div>
    </div>
  )
}
