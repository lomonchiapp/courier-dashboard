import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "@/app.module";

/** Sin PostgreSQL real, el init falla: omite estos tests. */
const describeOrSkip = process.env.SKIP_E2E === "1" ? describe.skip : describe;

describeOrSkip("Health (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it("GET /health/live returns ok", () => {
    return request(app.getHttpServer()).get("/health/live").expect(200).expect((res) => {
      expect(res.body.status).toBe("ok");
    });
  });
});
