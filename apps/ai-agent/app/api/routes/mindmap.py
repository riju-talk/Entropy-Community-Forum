"""
Mind map generation endpoint
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import logging
import re

logger = logging.getLogger(__name__)
router = APIRouter()


GOLD_STANDARD_MINDMAP_PROMPT = """
mindmap
  root((mindmap))
    Origins
      Long history
      ::icon(fa fa-book)
      Popularisation
        British popular psychology author Tony Buzan
    Research
      On effectiveness<br/>and features
      On Automatic creation
        Uses
            Creative techniques
            Strategic planning
            Argument mapping
    Tools
      Pen and paper
      Mermaid
"""

GOLD_STANDARD_STATE_DIAGRAM_PROMPT = """
    C4Context
      title System Context diagram for Internet Banking System
      Enterprise_Boundary(b0, "BankBoundary0") {
        Person(customerA, "Banking Customer A", "A customer of the bank, with personal bank accounts.")
        Person(customerB, "Banking Customer B")
        Person_Ext(customerC, "Banking Customer C", "desc")

        Person(customerD, "Banking Customer D", "A customer of the bank, <br/> with personal bank accounts.")

        System(SystemAA, "Internet Banking System", "Allows customers to view information about their bank accounts, and make payments.")

        Enterprise_Boundary(b1, "BankBoundary") {

          SystemDb_Ext(SystemE, "Mainframe Banking System", "Stores all of the core banking information about customers, accounts, transactions, etc.")

          System_Boundary(b2, "BankBoundary2") {
            System(SystemA, "Banking System A")
            System(SystemB, "Banking System B", "A system of the bank, with personal bank accounts. next line.")
          }

          System_Ext(SystemC, "E-mail system", "The internal Microsoft Exchange e-mail system.")
          SystemDb(SystemD, "Banking System D Database", "A system of the bank, with personal bank accounts.")

          Boundary(b3, "BankBoundary3", "boundary") {
            SystemQueue(SystemF, "Banking System F Queue", "A system of the bank.")
            SystemQueue_Ext(SystemG, "Banking System G Queue", "A system of the bank, with personal bank accounts.")
          }
        }
      }

      BiRel(customerA, SystemAA, "Uses")
      BiRel(SystemAA, SystemE, "Uses")
      Rel(SystemAA, SystemC, "Sends e-mails", "SMTP")
      Rel(SystemC, customerA, "Sends e-mails to")

      UpdateElementStyle(customerA, $fontColor="red", $bgColor="grey", $borderColor="red")
      UpdateRelStyle(customerA, SystemAA, $textColor="blue", $lineColor="blue", $offsetX="5")
      UpdateRelStyle(SystemAA, SystemE, $textColor="blue", $lineColor="blue", $offsetY="-10")
      UpdateRelStyle(SystemAA, SystemC, $textColor="blue", $lineColor="blue", $offsetY="-40", $offsetX="-50")
      UpdateRelStyle(SystemC, customerA, $textColor="red", $lineColor="red", $offsetX="-50", $offsetY="20")

      UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")

"""

GOLD_ENTITY_RELATIONSHIP_DIAGRAM_PROMPT = """

    erDiagram
    CUSTOMER ||--o{ ORDER : places
    CUSTOMER {
        string name
        string custNumber
        string sector
    }
    ORDER ||--|{ LINE-ITEM : contains
    ORDER {
        int orderNumber
        string deliveryAddress
    }
    LINE-ITEM {
        string productCode
        int quantity
        float pricePerUnit
    }


"""

GOLD_STANDARD_FLOWCHART_PROMPT = """

---
config:
  flowchart:
    htmlLabels: false
---
flowchart LR
    markdown["`This **is** _Markdown_`"]
    newLines["`Line1
    Line 2
    Line 3`"]
    markdown --> newLines

flowchart TD
    Start --> Stop

flowchart LR
    Start --> Stop

"""

GOLD_STANDARD_UML_DIAGRAM_PROMPT = """

---
title: Animal example
---
classDiagram
    note "From Duck till Zebra"
    Animal <|-- Duck
    note for Duck "can fly\ncan swim\ncan dive\ncan help in debugging"
    Animal <|-- Fish
    Animal <|-- Zebra
    Animal : +int age
    Animal : +String gender
    Animal: +isMammal()
    Animal: +mate()
    class Duck{
        +String beakColor
        +swim()
        +quack()
    }
    class Fish{
        -int sizeInFeet
        -canEat()
    }
    class Zebra{
        +bool is_wild
        +run()
    }
    """


GOLD_STANDARD_SEQUENCE_DIAGRAM_PROMPT = """

sequenceDiagram
    participant Alice@{ "type" : "boundary" }
    participant Bob
    Alice->>Bob: Request from boundary
    Bob->>Alice: Response to boundary

sequenceDiagram
    Alice->>John: Hello John, how are you?
    John-->>Alice: Great!
    Alice-)John: See you later!

"""
class MindmapRequest(BaseModel):
    topic: str
    diagram_type: Optional[str] = "mindmap"
    # requested detail level (1..5)
    detail_level: Optional[int] = 3
    systemPrompt: Optional[str] = None


# Target mermaid version for generated code (helps LLM produce compatible syntax)
MERMAID_VERSION = "10.9.5"


# try to import generator service (non-fatal)
try:
    from app.services.groq_service import groq_service  # type: ignore
    logger.info("groq_service available for mindmap generation")
except Exception as e:
    groq_service = None
    logger.warning("groq_service not available: %s", e)


# small helper: strip code fences and whitespace
def _strip_fences(text: str) -> str:
    if not text:
        return ""
    # remove ```mermaid blocks and any ``` fences
    text = re.sub(r"```mermaid\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"```", "", text)
    return text.strip()


# validate basic mermaid shape: must contain a known diagram keyword near start
def _looks_like_mermaid(code: str) -> bool:
    if not code:
        return False
    preview = code.strip().lower()[:200]
    # common mermaid entry tokens
    tokens = ["mindmap", "graph", "flowchart", "sequenceDiagram", "erDiagram", "classDiagram", "stateDiagram", "gantt"]
    return any(tok.lower() in preview for tok in tokens)


def _basic_mindmap(topic: str, detail_level: int) -> str:
    """
    Generate a minimal, valid Mermaid mindmap as a safe fallback.
    detail_level controls number of first-level children (1..5).
    """
    t = re.sub(r"[^A-Za-z0-9\s\-]", "", topic).strip() or "Topic"
    children = max(1, min(detail_level, 6))
    lines = ["mindmap", f"  root(({t}))"]
    for i in range(1, children + 1):
        lines.append(f"    Node{i}[{t} - subtopic {i}]")
        # add one nested child for higher detail levels
        if detail_level >= 4:
            lines.append(f"      Node{i}a[Detail {i}.a]")
    return "\n".join(lines)


@router.post("/")
async def generate_mindmap(payload: MindmapRequest) -> Dict[str, Any]:
    """
    Generate a Mermaid mindmap/diagram.
    The endpoint enforces a strong system prompt and validates/fixes Mermaid code before returning.
    """
    try:
        topic = (payload.topic or "").strip()
        if not topic:
            raise HTTPException(status_code=400, detail="Topic is required")

        diagram_type = (payload.diagram_type or "mindmap").strip()
        detail_level = int(payload.detail_level or 3)
        custom_prompt = payload.systemPrompt or ""

        logger.info("Mindmap request: topic=%s diagram_type=%s has_prompt=%s",
                    topic, diagram_type, bool(custom_prompt))

        if not groq_service:
            logger.error("groq_service missing - cannot generate mindmap")
            raise HTTPException(status_code=503, detail="Mindmap service unavailable")

        # Compose a strict system prompt to ensure valid Mermaid output
        strict_instructions = (
            "You are an assistant that MUST return only valid Mermaid diagram source suitable for direct rendering with Mermaid "
            f"version {MERMAID_VERSION}. Do NOT include any explanation, headings, or markdown fences. "
            "Return code that begins with an appropriate Mermaid diagram keyword (e.g., 'mindmap', 'graph', 'flowchart', "
            "'sequenceDiagram', 'erDiagram', 'classDiagram', 'stateDiagram', or 'gantt'). "
            "Ensure the syntax is correct and balanced so mermaid can render it. "
            "Follow the requested detail level strictly: 1 (high-level) .. 5 (very detailed). "
            "Use concise node and edge labels and avoid long paragraph text inside nodes. "
            "If the output is not valid Mermaid code, attempt to fix it when retrying."
            "This is the mermaid version 10.9.5, used in the frontend rendering."
        )

        # Combine user system prompt (if any) with strict instructions and the request context
        enhanced_prompt = (
            f"{strict_instructions}\n"
            f"Diagram type: {diagram_type}\n"
            f"Detail level (1..5): {detail_level}\n"
            f"Mermaid version: {MERMAID_VERSION}\n"
            f"User instructions: {custom_prompt}\n\n"
            f"Generate a {diagram_type} for the following topic:\n\n{topic}\n\n"
            "Return ONLY valid Mermaid source compatible with the specified mermaid version."
        )

        # Append a gold-standard example to help the model produce high-quality/compatible mermaid
        example = None
        dt = diagram_type.strip().lower()
        if "mindmap" in dt:
            example = GOLD_STANDARD_MINDMAP_PROMPT
        elif "flow" in dt or "flowchart" in dt:
            example = GOLD_STANDARD_FLOWCHART_PROMPT
        elif dt in ("er", "erd", "erdiagram", "er_diagram"):
            example = GOLD_ENTITY_RELATIONSHIP_DIAGRAM_PROMPT
        elif "sequence" in dt:
            example = GOLD_STANDARD_SEQUENCE_DIAGRAM_PROMPT
        elif "class" in dt or "uml" in dt:
            example = GOLD_STANDARD_UML_DIAGRAM_PROMPT
        elif "state" in dt:
            example = GOLD_STANDARD_STATE_DIAGRAM_PROMPT

        if example:
            enhanced_prompt = enhanced_prompt + "\n\nHigh-quality example to emulate (do NOT include any explanation, only the code):\n" + example
            logger.debug("Appended gold-standard example for diagram_type=%s", diagram_type)

        # Primary generation attempt
        try:
            mermaid_code = await groq_service.generate_mindmap(
                topic=topic,
                diagram_type=diagram_type,
                custom_prompt=enhanced_prompt
            )
        except Exception as e:
            logger.exception("groq_service.generate_mindmap failed: %s", e)
            # fallback to a safe generated mindmap rather than immediate 502
            fallback = _basic_mindmap(topic, detail_level)
            logger.warning("Returning fallback basic mindmap due to LLM failure")
            return {
                "mermaid_code": fallback,
                "diagram_type": diagram_type,
                "detail_level": detail_level,
                "mermaid_version": MERMAID_VERSION,
                "topic": topic,
                "fallback": True,
                "note": "Returned fallback diagram due to LLM error"
            }

        if mermaid_code is None:
            mermaid_code = ""

        mermaid_code = _strip_fences(str(mermaid_code))

        # Validate result
        if not _looks_like_mermaid(mermaid_code):
            logger.warning("Initial mermaid output did not validate. Attempting repair... Output: %s", mermaid_code[:300])
            # Retry with explicit repair instruction
            repair_prompt = (
                "The following Mermaid output may be invalid or wrapped in markdown. "
                "Please FIX it so it is valid Mermaid syntax and return ONLY the corrected Mermaid code with no fences or explanation.\n\n"
                f"Original output:\n{mermaid_code}\n\n"
                "Return the corrected Mermaid source now."
            )
            try:
                repaired = await groq_service.generate_mindmap(
                    topic=topic,
                    diagram_type=diagram_type,
                    custom_prompt=repair_prompt
                )
            except Exception as e:
                logger.exception("groq_service.repair attempt failed: %s", e)
                repaired = None

            if repaired:
                repaired = _strip_fences(str(repaired))
                if _looks_like_mermaid(repaired):
                    mermaid_code = repaired
                    logger.info("Mermaid output repaired successfully")
                else:
                    logger.warning("Repaired output still invalid. Repaired sample: %s", (repaired or "")[:300])
            else:
                logger.warning("No repaired output returned by LLM")

        # Final check
        if not _looks_like_mermaid(mermaid_code):
            # attempt repair (existing logic) then if still invalid use fallback
            logger.warning("Final mermaid output invalid after repair. Returning fallback.")
            fallback = _basic_mindmap(topic, detail_level)
            return {
                "mermaid_code": fallback,
                "diagram_type": diagram_type,
                "detail_level": detail_level,
                "mermaid_version": MERMAID_VERSION,
                "topic": topic,
                "fallback": True,
                "note": "Model output could not be validated; returned simple fallback diagram."
            }

        # Success - return sanitized mermaid code and metadata for frontend
        return {
            "mermaid_code": mermaid_code,
            "diagram_type": diagram_type,
            "detail_level": detail_level,
            "mermaid_version": MERMAID_VERSION,
            "topic": topic,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Mindmap generation failed: %s", e)
        raise HTTPException(status_code=500, detail="Mindmap generation failed")
