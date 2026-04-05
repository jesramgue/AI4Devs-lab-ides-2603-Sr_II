# Estrategia inicial

Dado que el ticket no es atómomico, hay que refinarlo desde el punto de vista de product, backend y frontend.

- Basándome en el vídeo de Álvaro me ha parecido una idea genial tener un agente especializado en producto que sea capaz de enriquecer una US
    - [Enrich US](./prompts/enrich_us.md)
- Tras esto voy a verificar que las tareas son suficientemente atómicas pidiendo a los agentes de frontend y backend que me creen un plan para satisfacer los requerimientos funcionales y no funcionales, acceptance criteria, DoD.
    - [Frontend-Ticket Split](./prompts/frontend_ticket_split.md)
    - [Backend-Ticket Split](./prompts/backend_ticket_split.md)
