import React from 'react';
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Tabs, Tab, useDisclosure} from "@heroui/react";
import AbioticSettingsView from "../../modules/simulationSettings/abiotic/views/AbioticSettingsView";
import AgentStatsSettingsView from '../../modules/simulationSettings/agentStats/views/AgentStatsSettingsView';
import AISettingsView from '../../modules/simulationSettings/ai/views/AISettingsView';
import BroadcastSettingsView from '../../modules/simulationSettings/broadcast/views/BroadcastSettingsView';
import DiseaseSettingsView from '../../modules/simulationSettings/disease/views/DiseaseSettingsView';
import EnvironmentSettingsView from '../../modules/simulationSettings/environment/views/EnvironmentSettingsView';
import FoodWebSettingsView from '../../modules/simulationSettings/foodWeb/views/FoodWebSettingsView';
import FusionSettingsView from '../../modules/simulationSettings/fusion/views/FusionSettingsView';
import GeneticsSettingsView from '../../modules/simulationSettings/genetics/views/GeneticsSettingsView';
import GravitySettingsView from '../../modules/simulationSettings/gravity/views/GravitySettingsView';
import LearningSettingsView from '../../modules/simulationSettings/learning/views/LearningSettingsView';
import PersonalitiesSettingsView from '../../modules/simulationSettings/personalities/views/PersonalitiesSettingsView';
import PrisonersDilemmaSettingsView from '../../modules/simulationSettings/prisonersDilemma/views/PrisonersDilemmaSettingsView';
import ProductionSettingsView from '../../modules/simulationSettings/production/views/ProductionSettingsView';
import ResourcesSettingsView from '../../modules/simulationSettings/resources/views/ResourcesSettingsView';
import SwarmSettingsView from '../../modules/simulationSettings/swarm/views/SwarmSettingsView';
import ToxinSettingsView from '../../modules/simulationSettings/toxin/views/ToxinSettingsView';
import VisionSettingsView from '../../modules/simulationSettings/vision/views/VisionSettingsView';
import WasteSettingsView from '../../modules/simulationSettings/waste/views/WasteSettingsView';

const SimulationNavButton: React.FC = () => {
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const tabs = [
        {
            id: "abiotic",
            label: "Abiotic",
            content: <AbioticSettingsView />,
        },
        {
            id: "agentStats",
            label: "Agent Stats",
            content: <AgentStatsSettingsView />,
        },
        {
            id: "ai",
            label: "AI",
            content: <AISettingsView />,
        },
        {
            id: "broadcast",
            label: "Broadcast",
            content: <BroadcastSettingsView />,
        },
        {
            id: "disease",
            label: "Disease",
            content: <DiseaseSettingsView />,
        },
        {
            id: "environment",
            label: "Environment",
            content: <EnvironmentSettingsView />,
        },
        {
            id: "foodWeb",
            label: "Food Web",
            content: <FoodWebSettingsView />,
        },
        {
            id: "fusion",
            label: "Fusion",
            content: <FusionSettingsView />,
        },
        {
            id: "genetics",
            label: "Genetics",
            content: <GeneticsSettingsView />,
        },
        {
            id: "gravity",
            label: "Gravity",
            content: <GravitySettingsView />,
        },
        {
            id: "learning",
            label: "Learning",
            content: <LearningSettingsView />,
        },
        {
            id: "personalities",
            label: "Personalities",
            content: <PersonalitiesSettingsView />,
        },
        {
            id: "prisonersDilemma",
            label: "Prisoner's Dilemma",
            content: <PrisonersDilemmaSettingsView />,
        },
        {
            id: "production",
            label: "Production",
            content: <ProductionSettingsView />,
        },
        {
            id: "resources",
            label: "Resources",
            content: <ResourcesSettingsView />,
        },
        {
            id: "swarm",
            label: "Swarm",
            content: <SwarmSettingsView />,
        },
        {
            id: "toxin",
            label: "Toxin",
            content: <ToxinSettingsView />,
        },
        {
            id: "vision",
            label: "Vision",
            content: <VisionSettingsView />,
        },
        {
            id: "waste",
            label: "Waste",
            content: <WasteSettingsView />,
        },
    ]

    return (
        <>
            <Button onPress={onOpen} className='text-base bg-white text-emerald-800'>
                Simulation
            </Button>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="4xl" isDismissable={false} isKeyboardDismissDisabled={false} hideCloseButton={true}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className='border-b p-5'>Modify Simulation</ModalHeader>
                            <ModalBody className='p-0'>
                                <Tabs items={tabs} className='py-5 px-3 border-r min-w-fit max-h-96 overflow-auto' classNames={{tabList: 'bg-transparent', tab: 'p-5', panel: 'p-5 max-h-96 overflow-auto', cursor: 'p-5 rounded-xl shadow-none'}} isVertical={true}>
                                    {(item) => (
                                        <Tab key={item.id} title={item.label}>
                                            {item.content}
                                        </Tab>
                                    )}
                                </Tabs>
                            </ModalBody>
                            <ModalFooter className='p-5 border-t'>
                                <Button onPress={onClose}>Done</Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}

export default SimulationNavButton;
