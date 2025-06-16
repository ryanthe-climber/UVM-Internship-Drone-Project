document.addEventListener('DOMContentLoaded', () => {
    const hamburgerIcon = document.querySelector('.hamburger-icon');
    const dropdownContent = document.querySelector('.dropdown-content');

    hamburgerIcon.addEventListener('click', () => {
        dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
    });

    // Event listeners for navigating to different stages
    document.getElementById('stage1Link').addEventListener('click', (e) => {
        e.preventDefault();
        game.startStage(Stage1);
    });

    document.getElementById('stage2Link').addEventListener('click', (e) => {
        e.preventDefault();
        game.startStage(Stage2);
    });

    document.getElementById('stage3Link').addEventListener('click', (e) => {
        e.preventDefault();
        game.startStage(Stage3);
    });
    
     document.getElementById('stage4Link').addEventListener('click', (e) => {
        e.preventDefault();
        game.startStage(Stage4);
    });
    
    document.getElementById('stage5Link').addEventListener('click', (e) => {
    	e.preventDefault();
    	game.startStage(Stage5);
	});

	document.getElementById('stage6Link').addEventListener('click', (e) => {
    	e.preventDefault();
    	game.startStage(Stage6);
	});
		
	document.getElementById('stage7Link').addEventListener('click', (e) => {
    	e.preventDefault();
    	game.startStage(Stage7);
	});
		
	document.getElementById('stage8Link').addEventListener('click', (e) => {
    	e.preventDefault();
    	game.startStage(Stage8);
	});
		
	document.getElementById('stage9Link').addEventListener('click', (e) => {
    	e.preventDefault();
    	game.startStage(Stage9);
	});
		
	document.getElementById('stage10Link').addEventListener('click', (e) => {
    	e.preventDefault();
    	game.startStage(Stage10);
	});
});
