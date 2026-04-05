# Estrategia inicial

Dado que el ticket no es atómomico, hay que refinarlo desde el punto de vista de product, backend y frontend.

- Basándome en el vídeo de Álvaro me ha parecido una idea genial tener un agente especializado en producto que sea capaz de enriquecer una US
    - [Enrich US](./prompts/enrich_us.md)
- Tras esto voy a verificar que las tareas son suficientemente atómicas pidiendo a los agentes de frontend y backend que me creen un plan para satisfacer los requerimientos funcionales y no funcionales, acceptance criteria, DoD.
    - [Frontend-Ticket Split](./prompts/frontend_ticket_split.md)
    - [Backend-Ticket Split](./prompts/backend_ticket_split.md)
- Con el split en tickets para backend y frontend detallando las tareas blocker de uno y otro con /plan pediré que teniendo en cuenta ambos tickets (dando contexto del ambos en ficheros Markdown) me genere un plan de implementación incluyendo validación manual, fases y memory banks:
    - [Implementation Plan](./prompts/implementation_plan.md)
- Basandome en el plan de implementación definido preguntaré en el implementation approach (multi-agente, autopilot, etc), parecido al metaprompt que vimos de Álvaro:
    - [Implementation Strategy](./prompts/implementation_strategy.md)
- Ahora usaré la estrategia de meta-prompt para que me de los prompts para cada una de las fases (en modo multi-agente como se define en la estrategia):
    - [Phase 1 Meta-Prompt](./prompts/phase-1-meta-prompt.md)