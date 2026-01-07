import ZAI from "z-ai-web-dev-sdk";

let zaiInstance: ZAI | null = null;

async function createZaiInstance(): Promise<ZAI> {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

// Immediately invoke the creation and save the promise.
const zaiInstancePromise = createZaiInstance();

// Export a proxy object that will wait for the instance to be ready.
export const zai = new Proxy({} as any, {
  get: (target, prop) => {
    return new Proxy(() => {}, {
      apply: (target, thisArg, args) => {
        return zaiInstancePromise.then(instance => {
          const service = instance[prop as keyof ZAI];
          const method = args[0]; // e.g., 'LLM'
          const realMethod = service[method as keyof typeof service];
          return realMethod.apply(service, args.slice(1));
        });
      },
    });
  },
});
