
import logoImg from "./assets/logo.png"
export class LoadScene extends Phaser.Scene { 

    constructor() {
        super('load_screen')
    }

    preload() {
        // this.load.image('logo', logoImg)

        this.cameras.main.setBackgroundColor('0xffffff')

        this.width = this.cameras.main.width;
        this.height = this.cameras.main.height;

        this.progressBar = this.add.graphics()
        this.progressBox = this.add.graphics()
        this.progressBox.fillStyle(0x000000, 0.3)
        this.progressBox.fillRect(this.width / 2 - 150, this.height / 2 - 30, 320, 50)

        // fake loading bar
        for (let i = 0; i < 80; i ++) {
            this.load.image('logo'+i, logoImg)
        }

        this.loadingText = this.make.text({
            x: this.width / 2,
            y: this.height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                fill: '#000000'
            }
        });
        this.loadingText.setOrigin(0.5, 0.5);

        this.percentText = this.make.text({
            x: this.width / 2,
            y: this.height / 2 - 5,
            text: '0%',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        this.percentText.setOrigin(0.5, 0.5);


        this.load.on('progress', (value) => {
            console.log(value)
            this.progressBar.clear()
            this.progressBar.fillStyle(0x228B22)
            this.progressBar.fillRect(this.width / 2 - 140, this.height / 2 - 20, 300 * value, 30)
            this.percentText.setText(parseInt(value * 100) + '%');
        })

        this.load.on('complete', () => {
            console.log('done')
            this.progressBar.destroy()
            this.progressBox.destroy()
            this.percentText.destroy()
            this.loadingText.destroy()
            this.scene.start('main_screen')
        })

        

    }

    create() {}

    update() {}
}