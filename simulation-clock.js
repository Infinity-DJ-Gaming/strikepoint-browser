// A worker keeps match simulation ticking while requestAnimationFrame is throttled.
setInterval(()=>postMessage(0),100);
