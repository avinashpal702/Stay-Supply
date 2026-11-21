const backgrounds = {
  Toiletries: ["#e6ebe2", "#d4dfd1"],
  "Bath & Linen": ["#eee8df", "#e0d6ca"],
  Pantry: ["#f1e7d8", "#e6d6c1"],
  Housekeeping: ["#e8e9df", "#d9ddcf"],
  "Welcome Kits": ["#eee5d9", "#e2d2bc"],
};

function getProductLabel(product) {
  const measurement = product.name.match(/\d+(?:\.\d+)?\s?(?:ml|l|g|kg|gsm|pairs|pack|pieces)\b/i)?.[0];
  if (measurement) {
    return measurement.replace(/\s+/g, " ").replace(/(\d)(ml|l|g|kg|gsm)\b/i, "$1 $2");
  }
  const packSize = product.unit.match(/(?:pack|box|roll) of \d+(?: pairs)?/i)?.[0];
  if (packSize) return packSize.toUpperCase();

  return product.category === "Bath & Linen" ? "COTTON" : "GUEST ESSENTIAL";
}

function Bottle({ label, color = "#45634d", large = false, pump = false, spray = false }) {
  const body = large
    ? { x: 194, y: 120, width: 252, height: 248, radius: 34 }
    : { x: 232, y: 164, width: 176, height: 204, radius: 34 };
  const neckX = body.x + body.width * 0.34;
  const neckWidth = body.width * 0.32;

  return (
    <g>
      <rect x={body.x} y={body.y} width={body.width} height={body.height} rx={body.radius} fill="#fffdf8" stroke="#dedbd1" strokeWidth="8" />
      <rect x={neckX} y={body.y - 33} width={neckWidth} height="42" rx="8" fill={color} />
      {pump && <><path d={`M${neckX + neckWidth / 2} ${body.y - 34}v-20h56v10h-38`} stroke={color} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" /><path d={`M${neckX + neckWidth / 2 + 16} ${body.y - 54}h40`} stroke={color} strokeWidth="11" strokeLinecap="round" /></>}
      {spray && <><rect x={body.x + body.width * 0.36} y={body.y - 47} width={body.width * 0.28} height="16" rx="5" fill={color} /><path d={`M${body.x + body.width / 2} ${body.y - 47}v-13h46`} stroke={color} strokeWidth="9" strokeLinecap="round" /></>}
      {!pump && !spray && <rect x={neckX} y={body.y - 30} width={neckWidth} height="13" rx="5" fill="#d7c6a9" />}
      <rect x={body.x + 17} y={body.y + body.height * 0.43} width={body.width - 34} height={body.height * 0.37} rx="10" fill={color} />
      <text x="320" y={body.y + body.height * 0.58} textAnchor="middle" fill="#fffdf8" fontFamily="Arial, sans-serif" fontSize={large ? "20" : "18"} fontWeight="700">{label}</text>
      <text x="320" y={body.y + body.height * 0.69} textAnchor="middle" fill="#f3ead8" fontFamily="Arial, sans-serif" fontSize={large ? "18" : "17"}>{large ? "CLEAN" : "AMENITY"}</text>
    </g>
  );
}

function Sachet({ label, color = "#a76b3b" }) {
  return (
    <g>
      <path d="M225 116h190l18 25-12 223H219l-12-223z" fill="#fffdf8" stroke="#dedbd1" strokeWidth="8" strokeLinejoin="round" />
      <path d="M216 157h198" stroke={color} strokeWidth="17" />
      <path d="M221 331h194" stroke={color} strokeWidth="17" />
      <text x="320" y="239" textAnchor="middle" fill="#344b39" fontFamily="Arial, sans-serif" fontSize="23" fontWeight="700">SINGLE USE</text>
      <text x="320" y="281" textAnchor="middle" fill={color} fontFamily="Arial, sans-serif" fontSize="25" fontWeight="700">{label}</text>
    </g>
  );
}

function Soap({ label }) {
  return (
    <g>
      <path d="M196 205q0-42 42-42h164q42 0 42 42v114q0 42-42 42H238q-42 0-42-42z" fill="#f9f4e9" stroke="#dedbd1" strokeWidth="8" />
      <path d="M214 231h212v61H214z" fill="#d8c6a7" />
      <text x="320" y="270" textAnchor="middle" fill="#405943" fontFamily="Arial, sans-serif" fontSize="23" fontWeight="700">GUEST SOAP</text>
      <text x="320" y="319" textAnchor="middle" fill="#5c5a50" fontFamily="Arial, sans-serif" fontSize="21">{label}</text>
    </g>
  );
}

function Towel({ label }) {
  return (
    <g>
      <path d="M151 273q0-19 19-19h300q19 0 19 19v87H151z" fill="#fffdf8" stroke="#dedbd1" strokeWidth="8" />
      <path d="M172 290h296v43H172z" fill="#e6e1d7" />
      <path d="M182 307h276" stroke="#bac4b4" strokeWidth="8" />
      <path d="M202 169q0-17 17-17h202q17 0 17 17v101H202z" fill="#f7f5ef" stroke="#dedbd1" strokeWidth="8" />
      <path d="M222 188h196v48H222z" fill="#e1e6dc" />
      <text x="320" y="219" textAnchor="middle" fill="#405943" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="700">{label}</text>
    </g>
  );
}

function BathMat({ label }) {
  return (
    <g>
      <rect x="142" y="185" width="356" height="174" rx="34" fill="#fffdf8" stroke="#dedbd1" strokeWidth="8" />
      <rect x="164" y="207" width="312" height="130" rx="22" fill="#e1e9e3" />
      {Array.from({ length: 7 }, (_, row) => Array.from({ length: 15 }, (_, column) => (
        <circle key={`${row}-${column}`} cx={180 + column * 20} cy={222 + row * 17} r="2.4" fill="#b9c9be" />
      )))}
      <path d="M190 312h260" stroke="#8ba99a" strokeWidth="6" strokeLinecap="round" />
      <text x="320" y="284" textAnchor="middle" fill="#405943" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="700">{label}</text>
    </g>
  );
}

function Slippers({ plush = false }) {
  const fill = plush ? "#f7f1e8" : "#e4ece8";
  const trim = plush ? "#d7c6a9" : "#9db4aa";

  return (
    <g fill={fill} stroke="#dedbd1" strokeWidth="8">
      <path d="M165 319c5-43 50-131 91-131 33 0 40 77 17 137-19 48-114 51-108-6z" />
      <path d="M352 319c5-43 50-131 91-131 33 0 40 77 17 137-19 48-114 51-108-6z" />
      <path d="M180 278q37-39 76-5m111 5q37-39 76-5" fill="none" stroke={trim} strokeWidth="13" />
    </g>
  );
}

function PantryPack({ label, color = "#9a7045" }) {
  return (
    <g>
      <rect x="195" y="142" width="250" height="226" rx="24" fill="#fffdf8" stroke="#dedbd1" strokeWidth="8" />
      <path d="M212 198h216" stroke={color} strokeWidth="22" />
      <path d="M212 325h216" stroke="#d7c49f" strokeWidth="16" />
      <text x="320" y="267" textAnchor="middle" fill="#405943" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="700">{label}</text>
      <text x="320" y="300" textAnchor="middle" fill="#77766e" fontFamily="Arial, sans-serif" fontSize="17">HOSPITALITY</text>
    </g>
  );
}

function PantrySachets({ label, color = "#9a7045" }) {
  return (
    <g>
      <rect x="145" y="157" width="350" height="211" rx="24" fill="#fffdf8" stroke="#dedbd1" strokeWidth="8" />
      <path d="M166 203h308" stroke={color} strokeWidth="17" />
      {[0, 1, 2].map((index) => {
        const x = 205 + index * 84;
        return (
          <g key={index} transform={`rotate(${(index - 1) * 7} ${x + 30} 278)`}>
            <path d={`M${x} 223h60l7 12-4 86h-66l-4-86z`} fill={index === 1 ? "#f4e3bf" : "#fff7e8"} stroke="#d8cbb5" strokeWidth="4" strokeLinejoin="round" />
            <path d={`M${x + 5} 242h55`} stroke={color} strokeWidth="7" />
            <text x={x + 31} y="278" textAnchor="middle" fill="#405943" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="700">{label}</text>
          </g>
        );
      })}
      <text x="320" y="341" textAnchor="middle" fill="#77766e" fontFamily="Arial, sans-serif" fontSize="15" fontWeight="700">SINGLE SERVE</text>
    </g>
  );
}

function GlassWaterBottle({ label }) {
  return (
    <g>
      <path d="M269 95h102v44l32 32v173q0 25-25 25h-116q-25 0-25-25V171l32-32z" fill="#d9f0ee" fillOpacity=".76" stroke="#a8c8c6" strokeWidth="8" strokeLinejoin="round" />
      <path d="M260 244q60-15 120 0v100q0 13-13 13h-94q-13 0-13-13z" fill="#82c5c1" fillOpacity=".8" />
      <rect x="271" y="75" width="98" height="34" rx="10" fill="#45634d" />
      <path d="M260 197h120" stroke="#fffdf8" strokeWidth="7" opacity=".8" />
      <text x="320" y="281" textAnchor="middle" fill="#fff" fontFamily="Arial, sans-serif" fontSize="21" fontWeight="700">{label}</text>
      <text x="320" y="310" textAnchor="middle" fill="#fff" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="700">GLASS</text>
    </g>
  );
}

function WelcomeCards({ label }) {
  return (
    <g>
      <rect x="167" y="142" width="226" height="211" rx="12" transform="rotate(-8 167 142)" fill="#d7c29e" stroke="#bca57f" strokeWidth="8" />
      <rect x="226" y="136" width="226" height="211" rx="12" transform="rotate(6 226 136)" fill="#fffdf8" stroke="#dedbd1" strokeWidth="8" />
      <text x="337" y="235" textAnchor="middle" fill="#405943" fontFamily="Georgia, serif" fontSize="24" fontStyle="italic">Welcome</text>
      <path d="M286 256h104" stroke="#bca57f" strokeWidth="5" />
      <text x="337" y="290" textAnchor="middle" fill="#77766e" fontFamily="Arial, sans-serif" fontSize="16">{label}</text>
    </g>
  );
}

function WelcomeTray({ label }) {
  return (
    <g>
      <rect x="135" y="259" width="370" height="93" rx="22" fill="#c6a875" />
      <rect x="155" y="274" width="330" height="61" rx="14" fill="#e2c99e" />
      <rect x="189" y="151" width="80" height="108" rx="17" fill="#fffdf8" stroke="#dedbd1" strokeWidth="8" />
      <rect x="209" y="131" width="40" height="27" rx="7" fill="#45634d" />
      <path d="M205 198h48" stroke="#45634d" strokeWidth="10" />
      <rect x="302" y="135" width="72" height="124" rx="17" fill="#a76b3b" />
      <rect x="405" y="169" width="63" height="90" rx="12" fill="#f7f1e6" stroke="#d8d0c2" strokeWidth="7" />
      <text x="320" y="319" textAnchor="middle" fill="#405943" fontFamily="Arial, sans-serif" fontSize="17" fontWeight="700">{label}</text>
    </g>
  );
}

function DentalKit() {
  return (
    <g>
      <rect x="155" y="131" width="330" height="237" rx="28" fill="#fffdf8" stroke="#dedbd1" strokeWidth="8" />
      <path d="M175 178h290v20H175z" fill="#d8e9df" />
      <rect x="228" y="218" width="18" height="108" rx="9" fill="#45634d" />
      <rect x="224" y="203" width="26" height="29" rx="5" fill="#fffdf8" stroke="#45634d" strokeWidth="5" />
      <path d="M229 208v13m8-13v13m8-13v13" stroke="#45634d" strokeWidth="2" />
      <path d="M337 222h60l-8 103h-45z" fill="#f3e7d0" stroke="#d2c2a8" strokeWidth="5" strokeLinejoin="round" />
      <rect x="347" y="208" width="40" height="21" rx="6" fill="#45634d" />
      <path d="M344 262h47" stroke="#a76b3b" strokeWidth="10" />
      <text x="320" y="350" textAnchor="middle" fill="#405943" fontFamily="Arial, sans-serif" fontSize="19" fontWeight="700">DENTAL KIT</text>
    </g>
  );
}

function VanityKit() {
  return (
    <g>
      <rect x="150" y="137" width="340" height="226" rx="28" fill="#fffdf8" stroke="#dedbd1" strokeWidth="8" />
      <path d="M175 182h290" stroke="#d8c6a7" strokeWidth="12" />
      <rect x="213" y="220" width="26" height="94" rx="11" fill="#a76b3b" />
      {Array.from({ length: 7 }, (_, index) => <path key={index} d={`M${216 + index * 4} 220v-15`} stroke="#a76b3b" strokeWidth="2" />)}
      <circle cx="319" cy="266" r="36" fill="#f0e9dd" stroke="#dedbd1" strokeWidth="5" />
      <circle cx="319" cy="266" r="22" fill="#fffdf8" />
      <path d="M387 238q42-23 64 13-5 47-42 55-32-11-34-42z" fill="#dcebe5" stroke="#b9cec4" strokeWidth="5" />
      <path d="M395 257q25 22 48 0" fill="none" stroke="#b9cec4" strokeWidth="4" />
      <text x="320" y="344" textAnchor="middle" fill="#405943" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="700">VANITY ESSENTIALS</text>
    </g>
  );
}

export default function ProductImage({ product, className = "" }) {
  const name = product.name.toLowerCase();
  const [background, accent] = backgrounds[product.category] || ["#ece9e0", "#ddd8cb"];
  const label = getProductLabel(product);
  let artwork;

  if (product.id === "custom-branded-amenity-set") {
    return <img src="/images/welcome-kit.png" alt={`${product.name} product photo`} className={className} />;
  }

  if (name.includes("bath mat")) {
    artwork = <BathMat label={label} />;
  } else if (name.includes("towel")) {
    artwork = <Towel label={label} />;
  } else if (name.includes("slipper")) {
    artwork = <Slippers plush={name.includes("terry")} />;
  } else if (name.includes("sachet") && product.category !== "Pantry") {
    artwork = <Sachet label={label} color={name.includes("conditioner") ? "#a76b3b" : "#45634d"} />;
  } else if (name.includes("soap")) {
    artwork = <Soap label={label} />;
  } else if (name.includes("dental kit")) {
    artwork = <DentalKit />;
  } else if (name.includes("vanity kit")) {
    artwork = <VanityKit />;
  } else if (name.includes("garbage bag")) {
    artwork = <g><rect x="238" y="140" width="164" height="213" rx="42" fill="#404d43" /><ellipse cx="320" cy="158" rx="82" ry="25" fill="#657365" /><ellipse cx="320" cy="344" rx="82" ry="25" fill="#313b34" /><text x="320" y="260" textAnchor="middle" fill="#fffdf8" fontFamily="Arial, sans-serif" fontSize="23" fontWeight="700">{label}</text><text x="320" y="292" textAnchor="middle" fill="#dbe1d8" fontFamily="Arial, sans-serif" fontSize="17">BIN LINERS</text></g>;
  } else if (name.includes("room freshener")) {
    artwork = <Bottle label={label} color="#69826a" spray />;
  } else if (name.includes("cleaner")) {
    artwork = <Bottle label={label} color="#55714f" large />;
  } else if (name.includes("pump dispenser")) {
    artwork = <Bottle label={label} color="#45634d" pump large />;
  } else if (name.includes("glass water bottle")) {
    artwork = <GlassWaterBottle label={label} />;
  } else if (name.includes("water")) {
    artwork = <Bottle label={label} color="#6e9a9a" />;
  } else if (product.category === "Pantry" && name.includes("sachet")) {
    artwork = <PantrySachets label={name.includes("tea") ? "TEA" : name.includes("coffee") ? "COFFEE" : "SUGAR"} color={name.includes("coffee") ? "#6c4735" : "#9a7045"} />;
  } else if (product.category === "Pantry") {
    artwork = <PantryPack label={name.includes("tea") ? "TEA" : name.includes("coffee") ? "COFFEE" : name.includes("sugar") ? "SUGAR" : product.name.toUpperCase()} />;
  } else if (product.category === "Toiletries") {
    artwork = <Bottle label={label} color={name.includes("conditioner") ? "#a76b3b" : "#45634d"} />;
  } else if (name.includes("welcome card")) {
    artwork = <WelcomeCards label={label} />;
  } else if (name.includes("welcome tray") || name.includes("amenity set")) {
    artwork = <WelcomeTray label={product.name.toUpperCase()} />;
  } else {
    artwork = <PantryPack label={product.category === "Pantry" ? product.name.toUpperCase() : label} />;
  }

  return (
    <svg
      viewBox="0 0 640 440"
      role="img"
      aria-label={`${product.name} product illustration`}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{product.name}</title>
      <rect width="640" height="440" rx="28" fill={background} />
      <circle cx="520" cy="88" r="72" fill="#fffdf8" opacity=".55" />
      <circle cx="94" cy="354" r="88" fill={accent} opacity=".35" />
      <ellipse cx="320" cy="377" rx="205" ry="20" fill="#344b39" opacity=".12" />
      {artwork}
    </svg>
  );
}
