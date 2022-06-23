
import * as THREE from 'three'
import Name from './World/Name'
import shaderMaterial from './CardShader'


export default function setAnimation(experience) {
    const exp = experience

    console.log(exp.model)
    if (exp.model.animations.length > 0) {
        exp.animation = {}
        const timeouts = []

        if (exp.isCard) {
            const waitForCard = () => {
                if (exp.experience.world.card) {

                    timeouts.forEach(timeout => {
                        console.log('timeout')
                        clearTimeout(timeout)
                    })

                    const logo = exp.experience.world.card.model.children.find(child => child.name === 'LOGO')
                    logo.material.visible = false

                    const originalButton = exp.experience.world.card.model.children.find(child => child.name === 'Button')
                    originalButton.material.visible = true
                    const originalButtonLED = exp.experience.world.card.model.children.find(child => child.name === 'AnimationLED')
                    originalButtonLED.material.visible = true

                    exp.experience.groups = exp.model.animations.map((animation, index) => {
                        const group = new THREE.Group()
                        const animName = new Name(exp.experience, false, animation.name, 0.35 - index * 0.22)
                        exp.experience.animationsNames.push(animName)
                        group.add(animName.cube)

                        if (index === 0) {
                            originalButton.position.y = 0.35
                            originalButtonLED.position.y = 0.35

                            group.add(originalButton)
                            group.add(originalButtonLED)

                            originalButton.userData = { name: animation.name }
                            exp.experience.buttonArray.push({ object: originalButton, name: animation.name })
                        } else {
                            const button = originalButton.clone()
                            const buttonLED = originalButtonLED.clone()

                            buttonLED.material = new THREE.MeshBasicMaterial({ color: 0x000000 })
                            buttonLED.material.onBeforeCompile = (shader) => { shaderMaterial(shader) }


                            button.position.y = 0.35 - index * 0.22
                            buttonLED.position.y = 0.35 - index * 0.22

                            group.add(button)
                            group.add(buttonLED)

                            button.userData.name = animation.name
                            exp.experience.buttonArray.push({ object: button, name: animation.name })
                        }
                        if (index > 5) {
                            animName.cube.visible = false
                        }
                        exp.scene.add(group)
                        return group
                    })
                }
                else {
                    console.log('retry')
                    timeouts.push(setTimeout(waitForCard, 200))
                }
            }
            waitForCard()
        }


        // console.log(exp.experience.animationsNames)

        // Mixer
        exp.animation.mixer = new THREE.AnimationMixer(exp.model)

        if (exp.debugFolder)
            exp.debugFolder.destroy()

        if (exp.debug) {

            // Actions
            exp.animation.actions = {}
            exp.debugFolder = exp.debug.addFolder('Animations')

            // if (!exp.experience.display) {

            exp.model.animations.forEach((animation) => {
                const debugObject = {
                    play: () => {
                        exp.animation.play(animation.name)
                        // if (exp.experience.guiPannel.debugObject.SendToHologram)
                        //     exp.experience.guiPannel.animation(animation.name)
                    }
                }
                exp.animation.actions[animation.name] = exp.animation.mixer.clipAction(animation)
                exp.debugFolder.add(debugObject, `play`).name(animation.name)
            })
            // }

            exp.animation.actions.current = exp.animation.actions[Object.keys(exp.animation.actions)[0]]
            exp.animation.current = exp.animation.actions.current

            // exp.experience.guiPannel.getAnimation()
        }

        // Play the action
        exp.animation.play = (name) => {
            const newAction = exp.animation.actions[name]

            const oldAction = exp.animation.current

            newAction.reset()
            newAction.play()
            newAction.crossFadeFrom(oldAction, 1)

            exp.animation.current = newAction
        }
    }
}