-- Create iso_clauses table to store standard clause statements
CREATE TABLE IF NOT EXISTS public.iso_clauses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  standard text NOT NULL,           -- '9001', '14001', '45001'
  clause text NOT NULL,             -- e.g. '4.1', '8.5.1'
  title text NOT NULL,              -- Short title
  requirement text NOT NULL,        -- Full clause requirement statement
  created_at timestamptz DEFAULT now(),
  UNIQUE(standard, clause)
);

-- Enable RLS
ALTER TABLE public.iso_clauses ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read clauses
CREATE POLICY "Anyone authenticated can read iso_clauses"
  ON public.iso_clauses FOR SELECT
  TO authenticated
  USING (true);

-- ─── ISO 9001:2015 Clauses ─────────────────────────────────────────────────
INSERT INTO public.iso_clauses (standard, clause, title, requirement) VALUES

('9001','4.1','Context of the Organization',
'The organization shall determine external and internal issues that are relevant to its purpose and its strategic direction and that affect its ability to achieve the intended result(s) of its quality management system. The organization shall monitor and review information about these external and internal issues.'),

('9001','4.2','Needs and Expectations of Interested Parties',
'The organization shall determine the interested parties that are relevant to the quality management system and the requirements of these interested parties relevant to the quality management system. The organization shall monitor and review information about these interested parties and their relevant requirements.'),

('9001','4.3','Scope of the QMS',
'The organization shall determine the boundaries and applicability of the quality management system to establish its scope. When determining this scope, the organization shall consider the external and internal issues, the requirements of relevant interested parties, and the products and services of the organization.'),

('9001','4.4','QMS and its Processes',
'The organization shall establish, implement, maintain and continually improve a quality management system, including the processes needed and their interactions, in accordance with the requirements of ISO 9001:2015. The organization shall determine the processes needed, their sequence and interaction, criteria and methods, resources, responsibilities, risks and opportunities, and opportunities for improvement.'),

('9001','5.1','Leadership and Commitment',
'Top management shall demonstrate leadership and commitment with respect to the quality management system by taking accountability for the effectiveness of the QMS, ensuring that the quality policy and quality objectives are established, ensuring that the requirements of the QMS are integrated into the organization''s business processes, and promoting the use of the process approach and risk-based thinking.'),

('9001','5.2','Quality Policy',
'Top management shall establish, implement and maintain a quality policy that is appropriate to the purpose and context of the organization, provides a framework for setting quality objectives, includes a commitment to satisfy applicable requirements, and includes a commitment to continual improvement of the quality management system.'),

('9001','5.3','Roles, Responsibilities and Authorities',
'Top management shall ensure that the responsibilities and authorities for relevant roles are assigned, communicated and understood within the organization. Top management shall assign the responsibility and authority for ensuring that the QMS conforms to the requirements of ISO 9001:2015 and for reporting on the performance of the QMS.'),

('9001','6.1','Actions to Address Risks and Opportunities',
'When planning for the quality management system, the organization shall consider the issues referred to in 4.1 and the requirements referred to in 4.2 and determine the risks and opportunities that need to be addressed to give assurance that the QMS can achieve its intended result(s), enhance desirable effects, prevent or reduce undesired effects, and achieve improvement.'),

('9001','6.2','Quality Objectives and Planning to Achieve Them',
'The organization shall establish quality objectives at relevant functions, levels and processes needed for the quality management system. Quality objectives shall be consistent with the quality policy, be measurable, take into account applicable requirements, be relevant to conformity of products and services, be monitored, be communicated, and be updated as appropriate.'),

('9001','6.3','Planning of Changes',
'When the organization determines the need for changes to the quality management system, the changes shall be carried out in a planned manner. The organization shall consider the purpose of the changes and their potential consequences, the integrity of the quality management system, the availability of resources, and the allocation or reallocation of responsibilities and authorities.'),

('9001','7.1','Resources',
'The organization shall determine and provide the resources needed for the establishment, implementation, maintenance and continual improvement of the quality management system, including people, infrastructure, environment for the operation of processes, monitoring and measuring resources, and organizational knowledge.'),

('9001','7.2','Competence',
'The organization shall determine the necessary competence of person(s) doing work under its control that affects the performance and effectiveness of the quality management system; ensure that these persons are competent on the basis of appropriate education, training, or experience; take actions to acquire the necessary competence; and retain appropriate documented information as evidence of competence.'),

('9001','7.3','Awareness',
'Persons doing work under the organization''s control shall be aware of the quality policy, relevant quality objectives, their contribution to the effectiveness of the quality management system, including the benefits of improved performance, and the implications of not conforming with the quality management system requirements.'),

('9001','7.4','Communication',
'The organization shall determine the internal and external communications relevant to the quality management system, including on what it will communicate, when to communicate, with whom to communicate, how to communicate, and who communicates.'),

('9001','7.5','Documented Information',
'The organization''s quality management system shall include documented information required by ISO 9001:2015 and documented information determined by the organization as being necessary for the effectiveness of the quality management system. Documented information shall be controlled to ensure it is available, suitable, and adequately protected.'),

('9001','8.1','Operational Planning and Control',
'The organization shall plan, implement, control, monitor and review the processes needed to meet the requirements for the provision of products and services, and to implement the actions determined in clause 6, by establishing criteria for the processes and for acceptance of products and services, and by determining the resources needed to achieve conformity.'),

('9001','8.2','Requirements for Products and Services',
'The organization shall implement a process for communicating with customers, determining the requirements for products and services to be offered, reviewing requirements related to the products and services, and handling changes to requirements for products and services. The organization shall ensure that it has the ability to meet the requirements before committing to supply products and services to a customer.'),

('9001','8.3','Design and Development of Products and Services',
'The organization shall establish, implement and maintain a design and development process that is appropriate to ensure the subsequent provision of products and services, including planning, inputs, controls, outputs, and changes. Design and development outputs shall meet the input requirements and be adequate for subsequent production and service provision.'),

('9001','8.4','Control of Externally Provided Processes, Products and Services',
'The organization shall ensure that externally provided processes, products and services conform to requirements. The organization shall determine the controls to be applied to externally provided processes, products and services when products and services from external providers are intended for incorporation into its own products and services, or provided directly to customers on behalf of the organization.'),

('9001','8.5','Production and Service Provision',
'The organization shall implement production and service provision under controlled conditions, including the availability of documented information, the use and control of suitable monitoring and measuring resources, the implementation of monitoring and measurement activities, the use of suitable infrastructure, the appointment of competent persons, and the implementation of actions to prevent human error.'),

('9001','8.6','Release of Products and Services',
'The organization shall implement planned arrangements, at appropriate stages, to verify that the product and service requirements have been met. The release of products and services to the customer shall not proceed until the planned arrangements have been satisfactorily completed, unless otherwise approved by a relevant authority and, as applicable, by the customer.'),

('9001','8.7','Control of Nonconforming Outputs',
'The organization shall ensure that outputs that do not conform to their requirements are identified and controlled to prevent their unintended use or delivery. The organization shall take appropriate action based on the nature of the nonconformity and its effect on the conformity of products and services. Documented information describing the nonconformity, actions taken, concessions obtained, and authority deciding the action shall be retained.'),

('9001','9.1','Monitoring, Measurement, Analysis and Evaluation',
'The organization shall determine what needs to be monitored and measured, the methods for monitoring, measurement, analysis and evaluation, when the monitoring and measuring shall be performed, and when the results from monitoring and measurement shall be analysed and evaluated. The organization shall retain appropriate documented information as evidence of the results.'),

('9001','9.2','Internal Audit',
'The organization shall conduct internal audits at planned intervals to provide information on whether the quality management system conforms to the organization''s own requirements and the requirements of ISO 9001:2015, and is effectively implemented and maintained. The organization shall plan, establish, implement and maintain an audit program including frequency, methods, responsibilities, planning requirements, and reporting.'),

('9001','9.3','Management Review',
'Top management shall review the organization''s quality management system, at planned intervals, to ensure its continuing suitability, adequacy, effectiveness and alignment with the strategic direction of the organization. The management review shall consider the status of actions from previous reviews, changes in external and internal issues, information on the performance and effectiveness of the QMS, and adequacy of resources.'),

('9001','10.1','Improvement - General',
'The organization shall determine and select opportunities for improvement and implement any necessary actions to meet customer requirements and enhance customer satisfaction. These shall include improving products and services to meet requirements, correcting, preventing or reducing undesired effects, and improving the performance and effectiveness of the quality management system.'),

('9001','10.2','Nonconformity and Corrective Action',
'When a nonconformity occurs, including any arising from complaints, the organization shall react to the nonconformity, evaluate the need for action to eliminate the causes of the nonconformity, implement any action needed, review the effectiveness of any corrective action taken, update risks and opportunities, and make changes to the quality management system if necessary.'),

('9001','10.3','Continual Improvement',
'The organization shall continually improve the suitability, adequacy and effectiveness of the quality management system. The organization shall consider the results of analysis and evaluation, and the outputs from management review, to determine if there are needs or opportunities that shall be addressed as part of continual improvement.')

ON CONFLICT (standard, clause) DO UPDATE SET
  title = EXCLUDED.title,
  requirement = EXCLUDED.requirement;

-- ─── ISO 14001:2015 Clauses ────────────────────────────────────────────────
INSERT INTO public.iso_clauses (standard, clause, title, requirement) VALUES

('14001','4.1','Understanding the Organization and its Context',
'The organization shall determine external and internal issues that are relevant to its purpose and that affect its ability to achieve the intended outcomes of its environmental management system. Such issues shall include environmental conditions being affected by or capable of affecting the organization.'),

('14001','4.2','Understanding the Needs and Expectations of Interested Parties',
'The organization shall determine the interested parties that are relevant to the environmental management system and their relevant needs and expectations (i.e. requirements), and which of these needs and expectations become its compliance obligations.'),

('14001','4.3','Determining the Scope of the EMS',
'The organization shall determine the boundaries and applicability of the environmental management system to establish its scope. When determining this scope, the organization shall consider the external and internal issues, compliance obligations, its organizational units, functions, and physical boundaries.'),

('14001','4.4','Environmental Management System',
'The organization shall establish, implement, maintain and continually improve an environmental management system, including the processes needed and their interactions, in accordance with the requirements of ISO 14001:2015.'),

('14001','5.1','Leadership and Commitment',
'Top management shall demonstrate leadership and commitment with respect to the environmental management system by taking accountability for the effectiveness of the EMS, ensuring that the environmental policy and environmental objectives are established, ensuring that the requirements of the EMS are integrated into the organization''s business processes, and communicating the importance of effective environmental management.'),

('14001','5.2','Environmental Policy',
'Top management shall establish, implement and maintain an environmental policy that is appropriate to the purpose and context of the organization, provides a framework for setting environmental objectives, includes a commitment to protect the environment including prevention of pollution, includes a commitment to fulfil its compliance obligations, and includes a commitment to continual improvement of the EMS.'),

('14001','5.3','Organizational Roles, Responsibilities and Authorities',
'Top management shall ensure that the responsibilities and authorities for relevant roles are assigned and communicated within the organization. Top management shall assign responsibility and authority for ensuring that the EMS conforms to the requirements of ISO 14001:2015 and for reporting on the performance of the EMS.'),

('14001','6.1','Actions to Address Risks and Opportunities',
'The organization shall establish, implement and maintain processes to determine the environmental aspects of its activities, products and services that it can control or influence; determine its compliance obligations; and determine other risks and opportunities that need to be addressed. The organization shall determine significant environmental aspects using established criteria.'),

('14001','6.2','Environmental Objectives and Planning to Achieve Them',
'The organization shall establish environmental objectives at relevant functions and levels, taking into account its significant environmental aspects, compliance obligations, and risks and opportunities. Environmental objectives shall be consistent with the environmental policy, measurable, monitored, communicated, and updated as appropriate.'),

('14001','7.1','Resources',
'The organization shall determine and provide the resources needed for the establishment, implementation, maintenance and continual improvement of the environmental management system, including people, infrastructure, and technology.'),

('14001','7.2','Competence',
'The organization shall determine the necessary competence of persons doing work under its control that affects its environmental performance and its ability to fulfil its compliance obligations; ensure these persons are competent; take actions to acquire the necessary competence; and retain documented information as evidence.'),

('14001','7.3','Awareness',
'Persons doing work under the organization''s control shall be aware of the environmental policy, significant environmental aspects and related or potential impacts associated with their work, their contribution to the effectiveness of the EMS including the benefits of enhanced environmental performance, and the implications of not conforming with EMS requirements including not fulfilling compliance obligations.'),

('14001','7.4','Communication',
'The organization shall establish, implement and maintain processes needed for internal and external communications relevant to the environmental management system, including what it will communicate, when to communicate, with whom to communicate, how to communicate, and taking into account its compliance obligations.'),

('14001','7.5','Documented Information',
'The organization''s EMS shall include documented information required by ISO 14001:2015, and documented information determined by the organization as being necessary for the effectiveness of the EMS. Documented information shall be controlled to ensure it is available and suitable for use, and is adequately protected.'),

('14001','8.1','Operational Planning and Control',
'The organization shall establish, implement, control and maintain the processes needed to meet requirements for the provision of its environmental management system, and to implement the actions determined in clause 6, by establishing operating criteria for the processes and implementing control of the processes in accordance with the operating criteria.'),

('14001','8.2','Emergency Preparedness and Response',
'The organization shall establish, implement and maintain processes needed to prepare for and respond to potential emergency situations, including planning actions to prevent or mitigate adverse environmental impacts from emergency situations, responding to actual emergency situations, taking action to prevent or mitigate the consequences, and periodically testing the planned emergency response procedures.'),

('14001','9.1','Monitoring, Measurement, Analysis and Evaluation',
'The organization shall monitor, measure, analyse and evaluate its environmental performance. The organization shall determine what needs to be monitored and measured, the methods for monitoring, measurement, analysis and evaluation, the criteria against which the organization will evaluate its environmental performance, and when monitoring and measuring shall be performed.'),

('14001','9.2','Internal Audit',
'The organization shall conduct internal audits at planned intervals to provide information on whether the EMS conforms to the organization''s own requirements and the requirements of ISO 14001:2015, and is effectively implemented and maintained. The organization shall plan, establish, implement and maintain an audit programme.'),

('14001','9.3','Management Review',
'Top management shall review the organization''s EMS at planned intervals to ensure its continuing suitability, adequacy and effectiveness. The management review shall take into account the status of actions from previous reviews, changes in external and internal issues, information on the environmental performance, the fulfilment of compliance obligations, and adequacy of resources.'),

('14001','10.1','General Improvement',
'The organization shall determine opportunities for improvement and implement necessary actions to achieve the intended outcomes of its environmental management system.'),

('14001','10.2','Nonconformity and Corrective Action',
'When a nonconformity occurs, the organization shall react to the nonconformity and take action to control and correct it, deal with the consequences, evaluate the need for action to eliminate the causes, implement any action needed, review the effectiveness of corrective action taken, and make changes to the EMS if necessary.'),

('14001','10.3','Continual Improvement',
'The organization shall continually improve the suitability, adequacy and effectiveness of the environmental management system to enhance environmental performance.')

ON CONFLICT (standard, clause) DO UPDATE SET
  title = EXCLUDED.title,
  requirement = EXCLUDED.requirement;

-- ─── ISO 45001:2018 Clauses ────────────────────────────────────────────────
INSERT INTO public.iso_clauses (standard, clause, title, requirement) VALUES

('45001','4.1','Understanding the Organization and its Context',
'The organization shall determine external and internal issues that are relevant to its purpose and that affect its ability to achieve the intended outcomes of its OH&S management system. These shall include the OH&S conditions and factors affecting, or capable of affecting, the organization''s activities.'),

('45001','4.2','Understanding the Needs and Expectations of Workers and Other Interested Parties',
'The organization shall determine the interested parties that are relevant to the OH&S management system; the relevant needs and expectations of these interested parties; and which of these needs and expectations are or could become legal requirements and other requirements.'),

('45001','4.3','Determining the Scope of the OH&S Management System',
'The organization shall determine the boundaries and applicability of the OH&S management system to establish its scope, taking into account the external and internal issues, legal requirements and other requirements, and the work-related activities that the organization carries out.'),

('45001','4.4','OH&S Management System',
'The organization shall establish, implement, maintain and continually improve an OH&S management system, including the processes needed and their interactions, in accordance with the requirements of ISO 45001:2018.'),

('45001','5.1','Leadership and Commitment',
'Top management shall demonstrate leadership and commitment with respect to the OH&S management system by taking overall responsibility for the prevention of work-related injury and ill health, ensuring that the OH&S policy and related OH&S objectives are established, ensuring that the requirements of the OH&S management system are integrated into the organization''s business processes, providing the resources needed, and communicating the importance of effective OH&S management.'),

('45001','5.2','OH&S Policy',
'Top management shall establish, implement and maintain an OH&S policy that includes a commitment to provide safe and healthy working conditions for the prevention of work-related injury and ill health, a commitment to fulfil legal requirements and other requirements, a commitment to eliminate hazards and reduce OH&S risks, a commitment to continual improvement of the OH&S management system, and a commitment to consultation and participation of workers.'),

('45001','5.3','Organizational Roles, Responsibilities and Authorities',
'Top management shall ensure that the responsibilities and authorities for relevant roles within the OH&S management system are assigned and communicated, and retained as documented information. Workers shall be empowered to report hazardous conditions so that corrective actions can be taken.'),

('45001','5.4','Consultation and Participation of Workers',
'The organization shall establish, implement and maintain processes for consultation and participation of workers at all applicable levels and functions, and where they exist, workers'' representatives in the development, planning, implementation, performance evaluation and actions for improvement of the OH&S management system.'),

('45001','6.1','Actions to Address Risks and Opportunities',
'When planning for the OH&S management system, the organization shall consider the issues referred to in 4.1, the requirements referred to in 4.2, and determine the hazards, OH&S risks and other risks to the OH&S management system, OH&S opportunities and other opportunities, and legal requirements and other requirements. The organization shall maintain and retain documented information on its hazards, OH&S risks, and opportunities.'),

('45001','6.2','OH&S Objectives and Planning to Achieve Them',
'The organization shall establish OH&S objectives at relevant functions and levels to maintain and continually improve the OH&S management system and OH&S performance. OH&S objectives shall be consistent with the OH&S policy, take into account applicable legal requirements and other requirements, be measurable, be monitored, be communicated, and be updated as appropriate.'),

('45001','7.1','Resources',
'The organization shall determine and provide the resources needed for the establishment, implementation, maintenance and continual improvement of the OH&S management system.'),

('45001','7.2','Competence',
'The organization shall determine the necessary competence of workers that affects or can affect its OH&S performance; ensure that workers are competent (including the ability to identify hazards) on the basis of appropriate education, training or experience; take actions to acquire and maintain the necessary competence; and retain appropriate documented information as evidence.'),

('45001','7.3','Awareness',
'Workers shall be aware of the OH&S policy and OH&S objectives, their contribution to the effectiveness of the OH&S management system, including the benefits of enhanced OH&S performance, the implications of not conforming with the OH&S management system requirements, and incidents, hazards, risks and investigations relevant to them.'),

('45001','7.4','Communication',
'The organization shall establish, implement and maintain processes needed for internal and external communications relevant to the OH&S management system, including what it will communicate, when to communicate, with whom to communicate, how to communicate, and taking into account legal requirements and other requirements, and ensuring workers'' views are represented.'),

('45001','7.5','Documented Information',
'The organization''s OH&S management system shall include documented information required by ISO 45001:2018 and documented information determined by the organization as being necessary for the effectiveness of the OH&S management system.'),

('45001','8.1','Operational Planning and Control',
'The organization shall plan, implement, control, monitor and review the processes needed to meet requirements of the OH&S management system, and to implement the actions determined in clause 6, by establishing criteria for the processes, implementing control of the processes in accordance with the criteria, and maintaining and retaining documented information to have confidence that the processes have been carried out as planned.'),

('45001','8.2','Management of Change',
'The organization shall establish processes for the implementation and control of planned temporary and permanent changes that impact OH&S performance, including new products, services and processes, changes to work processes, procedures, equipment or the organizational structure, and changes to legal requirements and other requirements.'),

('45001','8.3','Outsourcing',
'The organization shall ensure that outsourced functions and processes that affect the OH&S management system are controlled. The type and degree of control to be applied shall be defined within the OH&S management system.'),

('45001','8.4','Procurement',
'The organization shall establish, implement and maintain processes to control the procurement of products and services in order to ensure their conformity with its OH&S management system.'),

('45001','8.5','Contractors',
'The organization shall establish, implement and maintain processes to control contractors and their workers, to ensure that contractor operations and activities conform with the OH&S requirements established by the organization.'),

('45001','8.6','Emergency Preparedness and Response',
'The organization shall establish, implement and maintain processes needed to prepare for and respond to potential emergency situations, including planning actions to prevent or mitigate adverse OH&S impacts from emergency situations, providing training for the planned response, periodically testing and exercising the emergency response capability, and evaluating the response and take action to improve it.'),

('45001','9.1','Monitoring, Measurement, Analysis and Performance Evaluation',
'The organization shall monitor, measure, analyse and evaluate OH&S performance. The organization shall determine what needs to be monitored and measured, including the extent to which legal requirements and other requirements are fulfilled; the activities and operations related to identified hazards, risks and opportunities; progress toward achieving the organization''s OH&S objectives; and effectiveness of operational and other controls.'),

('45001','9.2','Internal Audit',
'The organization shall conduct internal audits at planned intervals to provide information on whether the OH&S management system conforms to the organization''s own requirements and the requirements of ISO 45001:2018, is effectively implemented and maintained, and helps the organization achieve its intended outcomes.'),

('45001','9.3','Management Review',
'Top management shall review the organization''s OH&S management system, at planned intervals, to ensure its continuing suitability, adequacy and effectiveness. The management review shall consider the status of actions from previous management reviews, changes in external and internal issues, the extent to which the OH&S policy and OH&S objectives have been achieved, and information on the OH&S performance.'),

('45001','10.1','General Improvement',
'The organization shall determine opportunities for improvement and implement necessary actions to achieve the intended outcomes of the OH&S management system.'),

('45001','10.2','Incident, Nonconformity and Corrective Action',
'The organization shall establish, implement and maintain processes, including reporting, investigating and taking action, to determine and manage incidents and nonconformities. When an incident or nonconformity occurs, the organization shall react in a timely manner, evaluate with participation of workers the need for corrective action, review existing assessments of OH&S risks and other risks, determine and implement action, and review the effectiveness of corrective action taken.'),

('45001','10.3','Continual Improvement',
'The organization shall continually improve the suitability, adequacy and effectiveness of the OH&S management system to enhance OH&S performance, promote a culture that supports the OH&S management system, promote the participation of workers in implementing actions for continual improvement, communicate the relevant results of continual improvement to its workers, and maintain and retain documented information as evidence of continual improvement.')

ON CONFLICT (standard, clause) DO UPDATE SET
  title = EXCLUDED.title,
  requirement = EXCLUDED.requirement;
