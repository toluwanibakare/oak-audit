<?php

namespace Database\Seeders;

use App\Models\IsoClause;
use Illuminate\Database\Seeder;

class IsoClauseSeeder extends Seeder
{
    public function run(): void
    {
        $clauses = [
            ['standard' => '9001', 'clause' => '4.1', 'title' => 'Context of the Organization', 'requirement' => 'The organization shall determine external and internal issues that are relevant to its purpose and its strategic direction and that affect its ability to achieve the intended result(s) of its quality management system.'],
            ['standard' => '9001', 'clause' => '4.2', 'title' => 'Needs and Expectations of Interested Parties', 'requirement' => 'The organization shall determine the interested parties that are relevant to the quality management system and the requirements of these interested parties.'],
            ['standard' => '9001', 'clause' => '4.3', 'title' => 'Scope of the QMS', 'requirement' => 'The organization shall determine the boundaries and applicability of the quality management system to establish its scope.'],
            ['standard' => '9001', 'clause' => '4.4', 'title' => 'QMS and its Processes', 'requirement' => 'The organization shall establish, implement, maintain and continually improve a quality management system, including the processes needed and their interactions.'],
            ['standard' => '9001', 'clause' => '5.1', 'title' => 'Leadership and Commitment', 'requirement' => 'Top management shall demonstrate leadership and commitment with respect to the quality management system.'],
            ['standard' => '9001', 'clause' => '5.2', 'title' => 'Quality Policy', 'requirement' => 'Top management shall establish, implement and maintain a quality policy that is appropriate to the purpose and context of the organization.'],
            ['standard' => '9001', 'clause' => '5.3', 'title' => 'Roles, Responsibilities and Authorities', 'requirement' => 'Top management shall ensure that the responsibilities and authorities for relevant roles are assigned, communicated and understood within the organization.'],
            ['standard' => '9001', 'clause' => '6.1', 'title' => 'Actions to Address Risks and Opportunities', 'requirement' => 'When planning for the quality management system, the organization shall consider the issues and determine the risks and opportunities that need to be addressed.'],
            ['standard' => '9001', 'clause' => '6.2', 'title' => 'Quality Objectives and Planning to Achieve Them', 'requirement' => 'The organization shall establish quality objectives at relevant functions, levels and processes needed for the quality management system.'],
            ['standard' => '9001', 'clause' => '6.3', 'title' => 'Planning of Changes', 'requirement' => 'When the organization determines the need for changes to the quality management system, the changes shall be carried out in a planned manner.'],
            ['standard' => '9001', 'clause' => '7.1', 'title' => 'Resources', 'requirement' => 'The organization shall determine and provide the resources needed for the establishment, implementation, maintenance and continual improvement of the quality management system.'],
            ['standard' => '9001', 'clause' => '7.2', 'title' => 'Competence', 'requirement' => 'The organization shall determine the necessary competence of person(s) doing work under its control that affects the performance and effectiveness of the quality management system.'],
            ['standard' => '9001', 'clause' => '7.3', 'title' => 'Awareness', 'requirement' => 'Persons doing work under the organization\'s control shall be aware of the quality policy, relevant quality objectives, their contribution to the effectiveness of the quality management system.'],
            ['standard' => '9001', 'clause' => '7.4', 'title' => 'Communication', 'requirement' => 'The organization shall determine the internal and external communications relevant to the quality management system.'],
            ['standard' => '9001', 'clause' => '7.5', 'title' => 'Documented Information', 'requirement' => 'The organization\'s quality management system shall include documented information required by ISO 9001:2015.'],
            ['standard' => '9001', 'clause' => '8.1', 'title' => 'Operational Planning and Control', 'requirement' => 'The organization shall plan, implement, control, monitor and review the processes needed to meet the requirements for the provision of products and services.'],
            ['standard' => '9001', 'clause' => '8.2', 'title' => 'Requirements for Products and Services', 'requirement' => 'The organization shall implement a process for communicating with customers, determining the requirements for products and services.'],
            ['standard' => '9001', 'clause' => '8.3', 'title' => 'Design and Development of Products and Services', 'requirement' => 'The organization shall establish, implement and maintain a design and development process that is appropriate to ensure the subsequent provision of products and services.'],
            ['standard' => '9001', 'clause' => '8.4', 'title' => 'Control of Externally Provided Processes, Products and Services', 'requirement' => 'The organization shall ensure that externally provided processes, products and services conform to requirements.'],
            ['standard' => '9001', 'clause' => '8.5', 'title' => 'Production and Service Provision', 'requirement' => 'The organization shall implement production and service provision under controlled conditions.'],
            ['standard' => '9001', 'clause' => '8.6', 'title' => 'Release of Products and Services', 'requirement' => 'The organization shall implement planned arrangements, at appropriate stages, to verify that the product and service requirements have been met.'],
            ['standard' => '9001', 'clause' => '8.7', 'title' => 'Control of Nonconforming Outputs', 'requirement' => 'The organization shall ensure that outputs that do not conform to their requirements are identified and controlled.'],
            ['standard' => '9001', 'clause' => '9.1', 'title' => 'Monitoring, Measurement, Analysis and Evaluation', 'requirement' => 'The organization shall determine what needs to be monitored and measured, the methods for monitoring, measurement, analysis and evaluation.'],
            ['standard' => '9001', 'clause' => '9.2', 'title' => 'Internal Audit', 'requirement' => 'The organization shall conduct internal audits at planned intervals to provide information on whether the quality management system conforms to requirements.'],
            ['standard' => '9001', 'clause' => '9.3', 'title' => 'Management Review', 'requirement' => 'Top management shall review the organization\'s quality management system, at planned intervals, to ensure its continuing suitability, adequacy, effectiveness.'],
            ['standard' => '9001', 'clause' => '10.1', 'title' => 'Improvement - General', 'requirement' => 'The organization shall determine and select opportunities for improvement and implement any necessary actions.'],
            ['standard' => '9001', 'clause' => '10.2', 'title' => 'Nonconformity and Corrective Action', 'requirement' => 'When a nonconformity occurs, the organization shall react to the nonconformity, evaluate the need for action to eliminate the causes.'],
            ['standard' => '9001', 'clause' => '10.3', 'title' => 'Continual Improvement', 'requirement' => 'The organization shall continually improve the suitability, adequacy and effectiveness of the quality management system.'],
            ['standard' => '14001', 'clause' => '4.1', 'title' => 'Understanding the Organization and its Context', 'requirement' => 'The organization shall determine external and internal issues that are relevant to its purpose and that affect its ability to achieve the intended outcomes of its environmental management system.'],
            ['standard' => '14001', 'clause' => '4.2', 'title' => 'Understanding the Needs and Expectations of Interested Parties', 'requirement' => 'The organization shall determine the interested parties that are relevant to the environmental management system.'],
            ['standard' => '14001', 'clause' => '4.3', 'title' => 'Determining the Scope of the EMS', 'requirement' => 'The organization shall determine the boundaries and applicability of the environmental management system to establish its scope.'],
            ['standard' => '14001', 'clause' => '4.4', 'title' => 'Environmental Management System', 'requirement' => 'The organization shall establish, implement, maintain and continually improve an environmental management system.'],
            ['standard' => '14001', 'clause' => '5.1', 'title' => 'Leadership and Commitment', 'requirement' => 'Top management shall demonstrate leadership and commitment with respect to the environmental management system.'],
            ['standard' => '14001', 'clause' => '5.2', 'title' => 'Environmental Policy', 'requirement' => 'Top management shall establish, implement and maintain an environmental policy that is appropriate to the purpose and context of the organization.'],
            ['standard' => '14001', 'clause' => '5.3', 'title' => 'Organizational Roles, Responsibilities and Authorities', 'requirement' => 'Top management shall ensure that the responsibilities and authorities for relevant roles are assigned and communicated within the organization.'],
            ['standard' => '14001', 'clause' => '6.1', 'title' => 'Actions to Address Risks and Opportunities', 'requirement' => 'The organization shall establish, implement and maintain processes to determine the environmental aspects of its activities, products and services.'],
            ['standard' => '14001', 'clause' => '6.2', 'title' => 'Environmental Objectives and Planning to Achieve Them', 'requirement' => 'The organization shall establish environmental objectives at relevant functions and levels.'],
            ['standard' => '14001', 'clause' => '7.1', 'title' => 'Resources', 'requirement' => 'The organization shall determine and provide the resources needed for the environmental management system.'],
            ['standard' => '14001', 'clause' => '7.2', 'title' => 'Competence', 'requirement' => 'The organization shall determine the necessary competence of persons doing work under its control.'],
            ['standard' => '14001', 'clause' => '7.3', 'title' => 'Awareness', 'requirement' => 'Persons doing work under the organization\'s control shall be aware of the environmental policy.'],
            ['standard' => '14001', 'clause' => '7.4', 'title' => 'Communication', 'requirement' => 'The organization shall establish, implement and maintain processes needed for internal and external communications.'],
            ['standard' => '14001', 'clause' => '7.5', 'title' => 'Documented Information', 'requirement' => 'The organization\'s EMS shall include documented information required by ISO 14001:2015.'],
            ['standard' => '14001', 'clause' => '8.1', 'title' => 'Operational Planning and Control', 'requirement' => 'The organization shall establish, implement, control and maintain the processes needed.'],
            ['standard' => '14001', 'clause' => '8.2', 'title' => 'Emergency Preparedness and Response', 'requirement' => 'The organization shall establish, implement and maintain processes needed to prepare for and respond to potential emergency situations.'],
            ['standard' => '14001', 'clause' => '9.1', 'title' => 'Monitoring, Measurement, Analysis and Evaluation', 'requirement' => 'The organization shall monitor, measure, analyse and evaluate its environmental performance.'],
            ['standard' => '14001', 'clause' => '9.2', 'title' => 'Internal Audit', 'requirement' => 'The organization shall conduct internal audits at planned intervals.'],
            ['standard' => '14001', 'clause' => '9.3', 'title' => 'Management Review', 'requirement' => 'Top management shall review the organization\'s EMS at planned intervals.'],
            ['standard' => '14001', 'clause' => '10.1', 'title' => 'General Improvement', 'requirement' => 'The organization shall determine opportunities for improvement.'],
            ['standard' => '14001', 'clause' => '10.2', 'title' => 'Nonconformity and Corrective Action', 'requirement' => 'When a nonconformity occurs, the organization shall react to the nonconformity.'],
            ['standard' => '14001', 'clause' => '10.3', 'title' => 'Continual Improvement', 'requirement' => 'The organization shall continually improve the suitability, adequacy and effectiveness of the environmental management system.'],
            ['standard' => '45001', 'clause' => '4.1', 'title' => 'Understanding the Organization and its Context', 'requirement' => 'The organization shall determine external and internal issues that are relevant to its purpose and that affect its ability to achieve the intended outcomes of its OH&S management system.'],
            ['standard' => '45001', 'clause' => '4.2', 'title' => 'Understanding the Needs and Expectations of Workers and Other Interested Parties', 'requirement' => 'The organization shall determine the interested parties that are relevant to the OH&S management system.'],
            ['standard' => '45001', 'clause' => '4.3', 'title' => 'Determining the Scope of the OH&S Management System', 'requirement' => 'The organization shall determine the boundaries and applicability of the OH&S management system.'],
            ['standard' => '45001', 'clause' => '4.4', 'title' => 'OH&S Management System', 'requirement' => 'The organization shall establish, implement, maintain and continually improve an OH&S management system.'],
            ['standard' => '45001', 'clause' => '5.1', 'title' => 'Leadership and Commitment', 'requirement' => 'Top management shall demonstrate leadership and commitment with respect to the OH&S management system.'],
            ['standard' => '45001', 'clause' => '5.2', 'title' => 'OH&S Policy', 'requirement' => 'Top management shall establish, implement and maintain an OH&S policy.'],
            ['standard' => '45001', 'clause' => '5.3', 'title' => 'Organizational Roles, Responsibilities and Authorities', 'requirement' => 'Top management shall ensure that the responsibilities and authorities for relevant roles within the OH&S management system are assigned and communicated.'],
            ['standard' => '45001', 'clause' => '5.4', 'title' => 'Consultation and Participation of Workers', 'requirement' => 'The organization shall establish, implement and maintain processes for consultation and participation of workers.'],
            ['standard' => '45001', 'clause' => '6.1', 'title' => 'Actions to Address Risks and Opportunities', 'requirement' => 'The organization shall determine the hazards, OH&S risks and other risks, OH&S opportunities, and legal requirements.'],
            ['standard' => '45001', 'clause' => '6.2', 'title' => 'OH&S Objectives and Planning to Achieve Them', 'requirement' => 'The organization shall establish OH&S objectives at relevant functions and levels.'],
            ['standard' => '45001', 'clause' => '7.1', 'title' => 'Resources', 'requirement' => 'The organization shall determine and provide the resources needed for the OH&S management system.'],
            ['standard' => '45001', 'clause' => '7.2', 'title' => 'Competence', 'requirement' => 'The organization shall determine the necessary competence of workers that affects or can affect its OH&S performance.'],
            ['standard' => '45001', 'clause' => '7.3', 'title' => 'Awareness', 'requirement' => 'Workers shall be aware of the OH&S policy and OH&S objectives.'],
            ['standard' => '45001', 'clause' => '7.4', 'title' => 'Communication', 'requirement' => 'The organization shall establish, implement and maintain processes needed for internal and external communications.'],
            ['standard' => '45001', 'clause' => '7.5', 'title' => 'Documented Information', 'requirement' => 'The organization\'s OH&S management system shall include documented information required by ISO 45001:2018.'],
            ['standard' => '45001', 'clause' => '8.1', 'title' => 'Operational Planning and Control', 'requirement' => 'The organization shall plan, implement, control, monitor and review the processes needed.'],
            ['standard' => '45001', 'clause' => '8.2', 'title' => 'Management of Change', 'requirement' => 'The organization shall establish processes for the implementation and control of planned temporary and permanent changes.'],
            ['standard' => '45001', 'clause' => '8.3', 'title' => 'Outsourcing', 'requirement' => 'The organization shall ensure that outsourced functions and processes that affect the OH&S management system are controlled.'],
            ['standard' => '45001', 'clause' => '8.4', 'title' => 'Procurement', 'requirement' => 'The organization shall establish, implement and maintain processes to control the procurement of products and services.'],
            ['standard' => '45001', 'clause' => '8.5', 'title' => 'Contractors', 'requirement' => 'The organization shall establish, implement and maintain processes to control contractors and their workers.'],
            ['standard' => '45001', 'clause' => '8.6', 'title' => 'Emergency Preparedness and Response', 'requirement' => 'The organization shall establish, implement and maintain processes needed to prepare for and respond to potential emergency situations.'],
            ['standard' => '45001', 'clause' => '9.1', 'title' => 'Monitoring, Measurement, Analysis and Performance Evaluation', 'requirement' => 'The organization shall monitor, measure, analyse and evaluate OH&S performance.'],
            ['standard' => '45001', 'clause' => '9.2', 'title' => 'Internal Audit', 'requirement' => 'The organization shall conduct internal audits at planned intervals.'],
            ['standard' => '45001', 'clause' => '9.3', 'title' => 'Management Review', 'requirement' => 'Top management shall review the organization\'s OH&S management system at planned intervals.'],
            ['standard' => '45001', 'clause' => '10.1', 'title' => 'General Improvement', 'requirement' => 'The organization shall determine opportunities for improvement.'],
            ['standard' => '45001', 'clause' => '10.2', 'title' => 'Incident, Nonconformity and Corrective Action', 'requirement' => 'The organization shall establish, implement and maintain processes to determine and manage incidents and nonconformities.'],
            ['standard' => '45001', 'clause' => '10.3', 'title' => 'Continual Improvement', 'requirement' => 'The organization shall continually improve the suitability, adequacy and effectiveness of the OH&S management system.'],
        ];

        foreach ($clauses as $clause) {
            IsoClause::firstOrCreate(
                ['standard' => $clause['standard'], 'clause' => $clause['clause']],
                $clause
            );
        }
    }
}
