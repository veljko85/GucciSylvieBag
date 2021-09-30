window.onbeforeunload = function () {
  window.scrollTo(0, 0);
};

var canvas = document.getElementById("renderCanvasBabylonGucci");

var engine = null;
var scene = null;
var sceneToRender = null;
var createDefaultEngine = function () {
  return new BABYLON.Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
    disableWebGL2Support: false,
  });
};
//for loading
BABYLON.DefaultLoadingScreen.prototype.displayLoadingUI = function () {
  if (document.getElementById("customLoadingScreenDiv")) {
    // Do not add a loading screen if there is already one
    document.getElementById("customLoadingScreenDiv").style.display = "initial";
    return;
  }
  this._loadingDiv = document.createElement("div");
  this._loadingDiv.id = "customLoadingScreenDiv";
  this._loadingDiv.innerHTML = `<div id="lottieWraper" style: width: 200px; height: 200px; background-color: red;></div>`;
  let animItem = bodymovin.loadAnimation({
    wrapper: this._loadingDiv,
    animType: "svg",
    loop: true,
    // rendererSettings: {
    //   progressiveLoad: false,
    //   preserveAspectRatio: "xMidYMid meet",
    //   viewBoxSize: "10 10 10 10",
    // },
    path: "https://assets1.lottiefiles.com/private_files/lf30_8tz9qhbm.json",
  });
  animItem.resize();
  animItem.addEventListener("DOMLoaded", function () {
    animItem.playSegments(
      [
        [0, 100],
        [32, 100],
      ],
      true
    );
  });
  var customLoadingScreenCss = document.createElement("style");
  customLoadingScreenCss.type = "text/css";
  if (document.body.clientWidth > document.body.clientHeight) {
    customLoadingScreenCss.innerHTML = `
                #customLoadingScreenDiv{
                  width: 100%;
                height: 100%;
                background-color: white;
                    z-index: 20;
                    position: fixed;
                }
                 `;
  } else {
    customLoadingScreenCss.innerHTML = `
                #customLoadingScreenDiv{
                  width: 100%;
                height: 100%;
                background-color: white;
                    z-index: 20;
                    position: fixed;
                }
                 `;
  }
  document.getElementsByTagName("head")[0].appendChild(customLoadingScreenCss);
  this._resizeLoadingUI();
  window.addEventListener("resize", this._resizeLoadingUI);
  document.body.appendChild(this._loadingDiv);
};

BABYLON.DefaultLoadingScreen.prototype.hideLoadingUI = function () {
  document.getElementById("customLoadingScreenDiv").style.display = "none";
  // console.log("scene is now loaded");
};
//end of loading
var createScene = function () {
  engine.displayLoadingUI();
  var scene = new BABYLON.Scene(engine);

  // scene.clearColor = new BABYLON.Color3.FromHexString("#ffffff");

  // var light = new BABYLON.HemisphericLight(
  //   "light",
  //   new BABYLON.Vector3(0, 1, 1),
  //   scene
  // );

  var camera = new BABYLON.ArcRotateCamera(
    "Camera",
    0,
    0,
    0,
    new BABYLON.Vector3(0, 0, 0),
    scene
  );
  camera.attachControl(canvas, true);
  camera.setPosition(new BABYLON.Vector3(3, 5, -8));
  scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);

  scene.environmentTexture = new BABYLON.CubeTexture(
    "https://raw.githubusercontent.com/veljko85/environments/gh-pages/environment.env",
    scene
  );

  var box = BABYLON.Mesh.CreateBox(
    "SkyBox",
    500,
    scene,
    false,
    BABYLON.Mesh.BACKSIDE
  );
  box.material = new BABYLON.SkyMaterial("sky", scene);
  box.material.inclination = -0.35;
  box.material.luminance = 0.8;
  box.material.azimuth = 0.25;
  box.material.cameraOffset.y = scene.activeCamera.globalPosition.y;
  box.position.y = 0;

  // Create a particle system

  var fogTexture = new BABYLON.Texture(
    "https://raw.githubusercontent.com/aWeirdo/Babylon.js/master/smoke_15.png",
    scene
  );

  var createNewSystem = function (
    emiter,
    particleSystemWidth,
    particleSystemHeight,
    particleSystem,
    useGPUVersion,
    gustina
  ) {
    if (particleSystem) {
      particleSystem.dispose();
    }

    if (useGPUVersion && BABYLON.GPUParticleSystem.IsSupported) {
      particleSystem = new BABYLON.GPUParticleSystem(
        "particles",
        { capacity: gustina },
        scene
      );
      particleSystem.activeParticleCount = 100;
      particleSystem.manualEmitCount = particleSystem.activeParticleCount;
      particleSystem.minEmitBox = new BABYLON.Vector3(0, 0, 0); // Starting all from
      particleSystem.maxEmitBox = new BABYLON.Vector3(
        particleSystemWidth,
        0.2,
        particleSystemHeight
      ); // To..
    } else {
      particleSystem = new BABYLON.ParticleSystem("particles", gustina, scene);
      particleSystem.manualEmitCount = particleSystem.getCapacity();
      particleSystem.minEmitBox = new BABYLON.Vector3(0, 0, 0); // Starting all from
      particleSystem.maxEmitBox = new BABYLON.Vector3(
        particleSystemWidth,
        0.2,
        particleSystemHeight
      ); // To...
    }

    particleSystem.particleTexture = fogTexture.clone();
    particleSystem.emitter = emiter;

    particleSystem.color1 = new BABYLON.Color4(0.8, 0.8, 0.8, 0.1);
    particleSystem.color2 = new BABYLON.Color4(0.95, 0.95, 0.95, 0.15);
    particleSystem.colorDead = new BABYLON.Color4(0.9, 0.9, 0.9, 0.1);
    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 0.1;
    particleSystem.minLifeTime = Number.MAX_SAFE_INTEGER;
    particleSystem.emitRate = 1000;
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
    particleSystem.gravity = new BABYLON.Vector3(0, 0, 0);
    particleSystem.direction1 = new BABYLON.Vector3(0, 0, 0);
    particleSystem.direction2 = new BABYLON.Vector3(0, 0, 0);
    particleSystem.minAngularSpeed = 1;
    particleSystem.maxAngularSpeed = 3;
    particleSystem.minEmitPower = 0.5;
    particleSystem.maxEmitPower = 0.5;
    particleSystem.updateSpeed = 0.005;

    particleSystem.start();
  };

  var particleSystem1;
  var useGPUVersion1 = false;

  //fountain to be emmietr for clouds-particles
  floreCloud = BABYLON.Mesh.CreateBox("floreCloud", 0.01, scene);
  if (window.innerWidth > window.innerHeight) {
    floreCloud.position = new BABYLON.Vector3(-0.5, -2.48, 0.5);
  } else {
    floreCloud.position = new BABYLON.Vector3(-0.5, -2.4, 0.5);
  }
  floreCloud.visibility = 0;

  createNewSystem(floreCloud, 1, 0.1, particleSystem1, useGPUVersion1, 2000);

  var particleSystem2;
  var useGPUVersion2 = false;

  cloudOne = BABYLON.Mesh.CreateBox("cloudOne", 0.01, scene);
  cloudOne.position = new BABYLON.Vector3(1, 0, -2);
  cloudOne.visibility = 0;

  createNewSystem(cloudOne, 0.4, 0.1, particleSystem2, useGPUVersion2, 100);

  var particleSystem3;
  var useGPUVersion3 = false;

  cloudOne = BABYLON.Mesh.CreateBox("cloudOne", 0.01, scene);
  cloudOne.position = new BABYLON.Vector3(-1, 0, -2);
  cloudOne.visibility = 0;

  createNewSystem(cloudOne, 0.7, 0.1, particleSystem3, useGPUVersion3, 100);

  var particleSystem4;
  var useGPUVersion4 = false;

  cloudOne = BABYLON.Mesh.CreateBox("cloudOne", 0.01, scene);
  cloudOne.position = new BABYLON.Vector3(2, -0.5, -1);
  cloudOne.visibility = 0;

  createNewSystem(cloudOne, 0.7, 0.1, particleSystem4, useGPUVersion4, 100);

  var particleSystem5;
  var useGPUVersion5 = false;

  cloudOne = BABYLON.Mesh.CreateBox("cloudOne", 0.01, scene);
  cloudOne.position = new BABYLON.Vector3(1, -2, -2);
  cloudOne.visibility = 0;

  createNewSystem(cloudOne, 0.4, 0.1, particleSystem5, useGPUVersion5, 100);

  var particleSystem6;
  var useGPUVersion6 = false;

  cloudOne = BABYLON.Mesh.CreateBox("cloudOne", 0.01, scene);
  cloudOne.position = new BABYLON.Vector3(1, -3, -1);
  cloudOne.visibility = 0;

  createNewSystem(cloudOne, 0.4, 0.1, particleSystem6, useGPUVersion6, 100);

  var particleSystem7;
  var useGPUVersion7 = false;

  cloudOne = BABYLON.Mesh.CreateBox("cloudOne", 0.01, scene);
  cloudOne.position = new BABYLON.Vector3(2, -3, 0);
  cloudOne.visibility = 0;

  createNewSystem(cloudOne, 0.3, 0.1, particleSystem7, useGPUVersion7, 100);

  var particleSystem8;
  var useGPUVersion8 = false;

  cloudOne = BABYLON.Mesh.CreateBox("cloudOne", 0.01, scene);
  cloudOne.position = new BABYLON.Vector3(1, -3, 1);
  cloudOne.visibility = 0;

  createNewSystem(cloudOne, 0.3, 0.2, particleSystem8, useGPUVersion8, 100);

  var particleSystem9;
  var useGPUVersion9 = false;

  cloudOne = BABYLON.Mesh.CreateBox("cloudOne", 0.01, scene);
  cloudOne.position = new BABYLON.Vector3(0, -2, -2);
  cloudOne.visibility = 0;

  createNewSystem(cloudOne, 0.4, 0.1, particleSystem9, useGPUVersion9, 100);

  var particleSystem10;
  var useGPUVersion10 = false;

  cloudOne = BABYLON.Mesh.CreateBox("cloudOne", 0.01, scene);
  cloudOne.position = new BABYLON.Vector3(-1, -2.5, -1);
  cloudOne.visibility = 0;

  createNewSystem(cloudOne, 0.4, 0.1, particleSystem10, useGPUVersion10, 100);

  var particleSystem11;
  var useGPUVersion11 = false;

  cloudOne = BABYLON.Mesh.CreateBox("cloudOne", 0.01, scene);
  cloudOne.position = new BABYLON.Vector3(-2, -3, 1);
  cloudOne.visibility = 0;

  createNewSystem(cloudOne, 0.4, 0.1, particleSystem11, useGPUVersion11, 100);

  BABYLON.SceneLoader.ImportMeshAsync(
    "",
    "https://raw.githubusercontent.com/veljko85/GucciSylvieBag/gh-pages/meshes/",
    "torba4.glb"
  ).then((result) => {
    var torba = result.meshes[0];
    // torba.rotationQuaternion = null;
    console.log(scene.cameras);
    if (window.innerWidth > window.innerHeight) {
      scene.activeCamera = scene.cameras[1];
    } else {
      scene.activeCamera = scene.cameras[2];
      scene.activeCamera.position.z = 0.3;
      scene.activeCamera.position.y = 0.01;
    }

    // scene.activeCamera.attachControl(canvas, false);

    scene.animationGroups
      .find((a) => a.name === "teloAction.001")
      .stop(true, 1, 0);

    var frame = 0;
    let oldValue = 0;
    let newValue = 0;
    var scrollDivBabylonGucci = document.getElementById(
      "scrollDivBabylonGucci"
    );
    window.addEventListener("scroll", () => {
      const currentScroll = window.pageYOffset;
      scrollDivBabylonGucci.style.height = (currentScroll / max) * 99 + "%";
      newValue = window.pageYOffset;
      console.log(currentScroll);
      scene.beforeRender = function () {
        if (
          window.innerWidth < window.innerHeight &&
          currentScroll < 7100 &&
          currentScroll > 3000
        ) {
          scene.activeCamera.position.z = currentScroll / 10000;
        }
        if (oldValue < newValue) {
          frame = currentScroll * 0.001;
          torba.position.y = -(currentScroll * 0.0001);
          if (currentScroll < 100) {
            scene.animationGroups
              .find((a) => a.name === "teloAction.001")
              .start(false, 1, 0);
          }
        } else if (oldValue > newValue) {
          frame = currentScroll * 0.001;
          torba.position.y = -(currentScroll * 0.0001);
        }
        oldValue = newValue;
        if (window.innerWidth > window.innerHeight) {
          scene.animationGroups
            .find((a) => a.name === "CameraAction")
            .play(true);
          scene.animationGroups
            .find((a) => a.name === "CameraAction")
            .goToFrame(frame);
          scene.animationGroups.find((a) => a.name === "CameraAction").pause();
        } else {
          scene.animationGroups
            .find((a) => a.name === "CameraAction.002")
            .play(true);
          scene.animationGroups
            .find((a) => a.name === "CameraAction.002")
            .goToFrame(frame);
          scene.animationGroups
            .find((a) => a.name === "CameraAction.002")
            .pause();
        }
      };
    });

    var teloMaterials = ["braon_koza", "plavi_tekstil", "sare_tekstil", "telo"];

    for (let i = 0; i < teloMaterials.length; i++) {
      scene.getMaterialByID(teloMaterials[i]).ambientTexture =
        new BABYLON.Texture(
          "https://raw.githubusercontent.com/veljko85/GucciSylvieBag/gh-pages/textures/telo.png",
          scene
        );
      scene.getMaterialByID(teloMaterials[i]).ambientTexture.uScale = 1; //and/or the following for vScale:
      scene.getMaterialByID(teloMaterials[i]).ambientTexture.vScale = -1; //(-1.0 or some other value)

      // scene.getMaterialByID(teloMaterials[i]).environmentIntensity = 0;
    }
    scene.getMaterialByID("masne").ambientTexture = new BABYLON.Texture(
      "https://raw.githubusercontent.com/veljko85/GucciSylvieBag/gh-pages/textures/masne.png",
      scene
    );
    scene.getMaterialByID("masne").ambientTexture.uScale = 1; //and/or the following for vScale:
    scene.getMaterialByID("masne").ambientTexture.vScale = -1; //(-1.0 or some other value)

    // scene.getMaterialByID("masne").environmentIntensity = 5;
    // scene.getMaterialByID("zlato").environmentIntensity = 5;

    let blackBagTagBabylonGucci = document.getElementById(
      "blackBagTagBabylonGucci"
    );
    blackBagTagBabylonGucci.onclick = () => {
      setTimeout(function () {
        scene.getMeshByName("telo_primitive0").material =
          scene.getMaterialByID("braon_koza");
        scene.getMeshByName("telo_primitive4").material =
          scene.getMaterialByID("braon_koza_rucka");
        scene.getMaterialByID("braon_koza").albedoColor =
          BABYLON.Color3.FromHexString("#000000");
        scene.getMaterialByID("sav").albedoColor =
          BABYLON.Color3.FromHexString("#000000");
      }, 500);
      scene.animationGroups
        .find((a) => a.name === "teloAction.001")
        .start(false, 1, 0);
    };

    let redBagTagBabylonGucci = document.getElementById(
      "redBagTagBabylonGucci"
    );
    redBagTagBabylonGucci.onclick = () => {
      setTimeout(function () {
        scene.getMeshByName("telo_primitive0").material =
          scene.getMaterialByID("telo");
        scene.getMeshByName("telo_primitive4").material =
          scene.getMaterialByID("rucka");
        scene.getMaterialByID("telo").albedoColor =
          BABYLON.Color3.FromHexString("#ff0000");
        scene.getMaterialByID("rucka").albedoColor =
          BABYLON.Color3.FromHexString("#ff0000");
        scene.getMaterialByID("sav").albedoColor =
          BABYLON.Color3.FromHexString("#ff0000");
      }, 500);
      scene.animationGroups
        .find((a) => a.name === "teloAction.001")
        .start(false, 1, 0);
    };

    let teksasBagTagBabylonGucci = document.getElementById(
      "teksasBagTagBabylonGucci"
    );
    teksasBagTagBabylonGucci.onclick = () => {
      setTimeout(function () {
        scene.getMeshByName("telo_primitive0").material =
          scene.getMaterialByID("plavi_tekstil");
        scene.getMeshByName("telo_primitive4").material = scene.getMaterialByID(
          "plavi_tekstil_rucka"
        );
        scene.getMaterialByID("sav").albedoColor =
          BABYLON.Color3.FromHexString("#000000");
      }, 500);
      scene.animationGroups
        .find((a) => a.name === "teloAction.001")
        .start(false, 1, 0);
    };

    let whiteBagTagBabylonGucci = document.getElementById(
      "whiteBagTagBabylonGucci"
    );
    whiteBagTagBabylonGucci.onclick = () => {
      setTimeout(function () {
        scene.getMeshByName("telo_primitive0").material =
          scene.getMaterialByID("telo");
        scene.getMeshByName("telo_primitive4").material =
          scene.getMaterialByID("rucka");
        scene.getMaterialByID("telo").albedoColor =
          BABYLON.Color3.FromHexString("#ffffff");
        scene.getMaterialByID("rucka").albedoColor =
          BABYLON.Color3.FromHexString("#ffffff");
        scene.getMaterialByID("sav").albedoColor =
          BABYLON.Color3.FromHexString("#ffffff");
      }, 500);
      scene.animationGroups
        .find((a) => a.name === "teloAction.001")
        .start(false, 1, 0);
    };

    let sareBagTagBabylonGucci = document.getElementById(
      "sareBagTagBabylonGucci"
    );
    sareBagTagBabylonGucci.onclick = () => {
      setTimeout(function () {
        scene.getMeshByName("telo_primitive0").material =
          scene.getMaterialByID("sare_tekstil");
        scene.getMeshByName("telo_primitive4").material =
          scene.getMaterialByID("sare_tekstil_rucka");
        scene.getMaterialByID("sav").albedoColor =
          BABYLON.Color3.FromHexString("#000000");
      }, 500);
      scene.animationGroups
        .find((a) => a.name === "teloAction.001")
        .start(false, 1, 0);
    };

    let brownBagTagBabylonGucci = document.getElementById(
      "brownBagTagBabylonGucci"
    );
    brownBagTagBabylonGucci.onclick = () => {
      setTimeout(function () {
        scene.getMeshByName("telo_primitive0").material =
          scene.getMaterialByID("braon_koza");
        scene.getMeshByName("telo_primitive4").material =
          scene.getMaterialByID("braon_koza_rucka");
        scene.getMaterialByID("braon_koza").albedoColor =
          BABYLON.Color3.FromHexString("#ffffff");
        scene.getMaterialByID("sav").albedoColor =
          BABYLON.Color3.FromHexString("#000000");
      }, 500);
      scene.animationGroups
        .find((a) => a.name === "teloAction.001")
        .start(false, 1, 0);
    };
    setTimeout(function () {
      engine.hideLoadingUI();
    }, 2000);
  });
  var landingPageContainerBabylonGucci = document.getElementById(
    "landingPageContainerBabylonGucci"
  );
  var bagPalleteBabylonGucci = document.getElementById(
    "bagPalleteBabylonGucci"
  );

  var firstTextBabylonGucci = document.getElementById("firstTextBabylonGucci");
  var secondTextBabylonGucci = document.getElementById(
    "secondTextBabylonGucci"
  );
  var thirdTextBabylonGucci = document.getElementById("thirdTextBabylonGucci");
  var fourthTextBabylonGucci = document.getElementById(
    "fourthTextBabylonGucci"
  );
  var shopButtonBabylonGucci = document.getElementById(
    "shopButtonBabylonGucci"
  );
  const checkpoint = 600;
  let max = document.body.scrollHeight - innerHeight;
  document.addEventListener("scroll", function () {
    // console.log(window.pageYOffset);
    if (window.pageYOffset <= checkpoint) {
      landingPageContainerBabylonGucci.style.opacity =
        1 - window.pageYOffset / checkpoint;
      bagPalleteBabylonGucci.style.opacity = window.pageYOffset / checkpoint;
    } else {
      landingPageContainerBabylonGucci.style.opacity = 0;
      bagPalleteBabylonGucci.style.opacity = 1;
    }
    if (window.innerWidth > window.innerHeight) {
      if (window.pageYOffset > 23600) {
        shopButtonBabylonGucci.style.display = "flex";
        shopButtonBabylonGucci.classList.remove("aniOpOff");
        shopButtonBabylonGucci.classList.add("aniOpOn");
        setTimeout(function () {
          shopButtonBabylonGucci.style.opacity = "1";
        }, 600);
      } else {
        shopButtonBabylonGucci.classList.remove("aniOpOn");
        shopButtonBabylonGucci.classList.add("aniOpOff");
        setTimeout(function () {
          shopButtonBabylonGucci.style.opacity = "0";
          // shopButtonBabylonGucci.style.display = "none";
        }, 600);
      }
    } else if (window.innerWidth < window.innerHeight) {
      if (window.pageYOffset > 23000) {
        shopButtonBabylonGucci.style.display = "flex";
        shopButtonBabylonGucci.classList.remove("aniOpOff");
        shopButtonBabylonGucci.classList.add("aniOpOn");
        setTimeout(function () {
          shopButtonBabylonGucci.style.opacity = "1";
        }, 600);
      } else {
        shopButtonBabylonGucci.classList.remove("aniOpOn");
        shopButtonBabylonGucci.classList.add("aniOpOff");
        setTimeout(function () {
          shopButtonBabylonGucci.style.opacity = "0";
          // shopButtonBabylonGucci.style.display = "none";
        }, 600);
      }
    }

    if (window.pageYOffset > 3400 && window.pageYOffset < 5500) {
      firstTextBabylonGucci.style.display = "block";
      firstTextBabylonGucci.classList.remove("aniOpOff");
      firstTextBabylonGucci.classList.add("aniOpOn");
      setTimeout(function () {
        firstTextBabylonGucci.style.opacity = "1";
      }, 600);
    }
    if (window.pageYOffset < 3400 || window.pageYOffset > 5500) {
      firstTextBabylonGucci.classList.remove("aniOpOn");
      firstTextBabylonGucci.classList.add("aniOpOff");
      setTimeout(function () {
        firstTextBabylonGucci.style.opacity = "0";
        firstTextBabylonGucci.style.display = "none";
      }, 600);
    }

    if (window.pageYOffset > 7500 && window.pageYOffset < 9700) {
      secondTextBabylonGucci.style.display = "block";
      secondTextBabylonGucci.classList.add("aniOpOn");
      secondTextBabylonGucci.classList.remove("aniOpOff");
      setTimeout(function () {
        secondTextBabylonGucci.style.opacity = "1";
      }, 600);
    }
    if (window.pageYOffset < 7500 || window.pageYOffset > 9700) {
      secondTextBabylonGucci.classList.remove("aniOpOn");
      secondTextBabylonGucci.classList.add("aniOpOff");
      setTimeout(function () {
        secondTextBabylonGucci.style.opacity = "0";
        secondTextBabylonGucci.style.display = "none";
      }, 600);
    }

    if (window.pageYOffset > 13700 && window.pageYOffset < 18000) {
      thirdTextBabylonGucci.style.display = "block";
      thirdTextBabylonGucci.classList.remove("aniOpOff");
      thirdTextBabylonGucci.classList.add("aniOpOn");
      setTimeout(function () {
        thirdTextBabylonGucci.style.opacity = "1";
      }, 600);
    }
    if (window.pageYOffset < 13700 || window.pageYOffset > 18000) {
      thirdTextBabylonGucci.classList.remove("aniOpOn");
      thirdTextBabylonGucci.classList.add("aniOpOff");
      setTimeout(function () {
        thirdTextBabylonGucci.style.opacity = "0";
        thirdTextBabylonGucci.style.display = "none";
      }, 600);
    }

    if (window.pageYOffset > 18500 && window.pageYOffset < 20100) {
      fourthTextBabylonGucci.style.display = "block";
      fourthTextBabylonGucci.classList.remove("aniOpOff");
      fourthTextBabylonGucci.classList.add("aniOpOn");
      setTimeout(function () {
        fourthTextBabylonGucci.style.opacity = "1";
      }, 600);
    }
    if (window.pageYOffset < 18500 || window.pageYOffset > 20100) {
      fourthTextBabylonGucci.classList.remove("aniOpOn");
      fourthTextBabylonGucci.classList.add("aniOpOff");
      setTimeout(function () {
        fourthTextBabylonGucci.style.opacity = "0";
        fourthTextBabylonGucci.style.display = "none";
      }, 600);
    }
  });

  return scene;
};

window.initFunction = async function () {
  var asyncEngineCreation = async function () {
    try {
      return createDefaultEngine();
    } catch (e) {
      console.log(
        "the available createEngine function failed. Creating the default engine instead"
      );
      return createDefaultEngine();
    }
  };

  window.engine = await asyncEngineCreation();
  if (!engine) throw "engine should not be null.";
  window.scene = createScene();
};
initFunction().then(() => {
  sceneToRender = scene;
  engine.runRenderLoop(function () {
    if (sceneToRender && sceneToRender.activeCamera) {
      sceneToRender.render();
    }
  });
});

// Resize
window.addEventListener("resize", function () {
  engine.resize();
});

SmoothScroll({
  // Scrolling Core
  animationTime: 2000, // [ms]
  stepSize: 100, // [px]

  // Acceleration
  accelerationDelta: 50, // 50
  accelerationMax: 3, // 3

  // Keyboard Settings
  keyboardSupport: true, // option
  arrowScroll: 50, // [px]

  // Pulse (less tweakable)
  // ratio of "tail" to "acceleration"
  pulseAlgorithm: true,
  pulseScale: 4,
  pulseNormalize: 1,

  // Other
  touchpadSupport: false, // ignore touchpad by default
  fixedBackground: true,
  excluded: "",
});
